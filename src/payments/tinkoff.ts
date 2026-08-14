import crypto from 'crypto';
import axios from 'axios';
import { getDb } from '../database';
import { addPaidRequests } from '../balance';
import { PACKAGES } from '../consts';

const API_URL = 'https://securepay.tinkoff.ru';

interface ITinkoffInitResponse {
  Success: boolean;
  PaymentId: string;
  PaymentURL: string;
  ErrorCode?: string;
  Message?: string;
  Details?: string;
}

interface ITinkoffGetStateResponse {
  Success: boolean;
  Status: string;
  PaymentId: string;
  OrderId: string;
  Amount: number;
  Message?: string;
}

function getCredentials() {
  const terminalKey = process.env.TINKOFF_TERMINAL_KEY;
  const password = process.env.TINKOFF_PASSWORD;
  if (!terminalKey || !password) {
    throw new Error('TINKOFF_TERMINAL_KEY and TINKOFF_PASSWORD must be set in .env');
  }
  return { terminalKey, password };
}

function generateToken(password: string, params: Record<string, string | number>): string {
  const values: Record<string, string> = {};
  for (const [key, val] of Object.entries(params)) {
    values[key] = String(val);
  }
  values.Password = password;
  const sorted = Object.keys(values).sort();
  const concated = sorted.map((k) => values[k]).join('');
  return crypto.createHash('sha256').update(concated).digest('hex');
}

export interface IPaymentRecord {
  id: number;
  user_id: number;
  package_key: string;
  amount: number;
  tinkoff_payment_id: string;
  tinkoff_order_id: string;
  status: string;
  created_at: string;
}

export async function createPayment(userId: number, packageKey: string): Promise<{ paymentUrl: string; paymentId: number }> {
  const { terminalKey, password } = getCredentials();
  const pkg = PACKAGES.find((p) => p.key === packageKey);
  if (!pkg) throw new Error(`Package ${packageKey} not found`);

  const amountInKopecks = pkg.price * 100;
  const tinkoffOrderId = `pzd_${userId}_${packageKey}_${Date.now()}`;

  console.log(`[PAYMENT] Creating payment userId=${userId} package=${packageKey} amount=${pkg.price}₽ orderId=${tinkoffOrderId}`);

  const description = `Пакет "${pkg.label}" — ${pkg.requests} запросов`;

  const token = generateToken(password, {
    TerminalKey: terminalKey,
    Amount: amountInKopecks,
    OrderId: tinkoffOrderId,
    Description: description,
  });

  const { data } = await axios.post<ITinkoffInitResponse>(`${API_URL}/v2/Init/`, {
    TerminalKey: terminalKey,
    Amount: amountInKopecks,
    OrderId: tinkoffOrderId,
    Description: description,
    Token: token,
  });

  if (!data.Success) {
    console.error(`[PAYMENT] Init FAILED userId=${userId} error=${data.Message} code=${data.ErrorCode}`);
    throw new Error(
      `Tinkoff Init failed: ${data.Message || 'unknown error'}` +
      (data.Details ? ` (${data.Details})` : '') +
      (data.ErrorCode ? ` [code ${data.ErrorCode}]` : '')
    );
  }

  const db = getDb();
  const result = db.prepare(`
    INSERT INTO payments (user_id, package_key, amount, tinkoff_payment_id, tinkoff_order_id, created_at)
    VALUES (?, ?, ?, ?, ?, datetime('now', 'localtime'))
  `  ).run(userId, packageKey, pkg.price, data.PaymentId, tinkoffOrderId);

  console.log(`[PAYMENT] Created paymentId=${data.PaymentId} for userId=${userId}`);

  return { paymentUrl: data.PaymentURL, paymentId: Number(result.lastInsertRowid) };
}

export async function checkPayment(paymentId: number, userId: number): Promise<{ confirmed: boolean; message: string }> {
  const db = getDb();
  const payment = db.prepare(`
    SELECT * FROM payments WHERE id = ? AND user_id = ?
  `).get(paymentId, userId) as IPaymentRecord | undefined;

  if (!payment) return { confirmed: false, message: 'Платёж не найден.' };
  if (payment.status === 'confirmed') {
    console.log(`[PAYMENT] check paymentId=${paymentId} already confirmed`);
    return { confirmed: true, message: 'Платёж уже подтверждён ранее.' };
  }
  if (payment.status === 'failed') {
    console.log(`[PAYMENT] check paymentId=${paymentId} already failed`);
    return { confirmed: false, message: 'Платёж отклонён.' };
  }

  const { terminalKey, password } = getCredentials();
  const token = generateToken(password, {
    TerminalKey: terminalKey,
    PaymentId: payment.tinkoff_payment_id,
  });

  try {
    const { data } = await axios.post<ITinkoffGetStateResponse>(`${API_URL}/v2/GetState/`, {
      TerminalKey: terminalKey,
      PaymentId: payment.tinkoff_payment_id,
      Token: token,
    });

    console.log(`[PAYMENT] check paymentId=${paymentId} tinkoffStatus=${data.Status}`);

    if (data.Success && data.Status === 'CONFIRMED') {
      const pkg = PACKAGES.find((p) => p.key === payment.package_key);
      if (!pkg) {
        console.error(`[PAYMENT] CONFIRMED but package not found: ${payment.package_key}`);
        return { confirmed: true, message: '✅ Оплата подтверждена, но пакет не найден. Обратитесь к администратору.' };
      }

      const confirmPayment = db.transaction(() => {
        addPaidRequests(userId, pkg.requests);
        db.prepare(`UPDATE payments SET status = 'confirmed' WHERE id = ?`).run(paymentId);
      });
      confirmPayment();

      console.log(`[PAYMENT] CONFIRMED paymentId=${paymentId} userId=${userId} added=${pkg.requests} requests`);

      return {
        confirmed: true,
        message: `✅ Оплата подтверждена!\nПакет «${pkg.label}» активирован — ${pkg.requests} запросов добавлено.`,
      };
    }

    if (data.Status === 'REJECTED' || data.Status === 'CANCELED' || data.Status === 'REVERSED') {
      db.prepare(`UPDATE payments SET status = 'failed' WHERE id = ?`).run(paymentId);
      console.log(`[PAYMENT] REJECTED paymentId=${paymentId} status=${data.Status}`);
      return { confirmed: false, message: `❌ Платёж отклонён (${data.Status}).` };
    }

    return { confirmed: false, message: `⏳ Статус платежа: ${data.Status}. Попробуйте позже.` };
  } catch (err: any) {
    console.error('[TINKOFF] CheckPayment error:', err?.message ?? err, err?.response?.data ?? '');
    return { confirmed: false, message: '❌ Ошибка при проверке платежа. Попробуйте позже.' };
  }
}
