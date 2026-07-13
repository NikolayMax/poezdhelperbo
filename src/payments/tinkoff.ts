import crypto from 'crypto';
import axios from 'axios';
import { getDb } from '../database';
import { ensureUser, addPaidRequests } from '../balance';
import { PACKAGES } from '../consts';

const API_URL = 'https://securepay.tinkoff.ru';

interface TinkoffInitResponse {
  Success: boolean;
  PaymentId: string;
  PaymentURL: string;
  ErrorCode?: string;
  Message?: string;
  Details?: string;
}

interface TinkoffGetStateResponse {
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

  const description = `Пакет "${pkg.label}" — ${pkg.requests} запросов`;

  const token = generateToken(password, {
    TerminalKey: terminalKey,
    Amount: amountInKopecks,
    OrderId: tinkoffOrderId,
    Description: description,
  });

  const { data } = await axios.post<TinkoffInitResponse>(`${API_URL}/v2/Init/`, {
    TerminalKey: terminalKey,
    Amount: amountInKopecks,
    OrderId: tinkoffOrderId,
    Description: description,
    Token: token,
  });

  if (!data.Success) {
    throw new Error(
      `Tinkoff Init failed: ${data.Message || 'unknown error'}` +
      (data.Details ? ` (${data.Details})` : '') +
      (data.ErrorCode ? ` [code ${data.ErrorCode}]` : '')
    );
  }

  ensureUser(userId);
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO payments (user_id, package_key, amount, tinkoff_payment_id, tinkoff_order_id)
    VALUES (?, ?, ?, ?, ?)
  `).run(userId, packageKey, pkg.price, data.PaymentId, tinkoffOrderId);

  return { paymentUrl: data.PaymentURL, paymentId: Number(result.lastInsertRowid) };
}

export async function checkPayment(paymentId: number, userId: number): Promise<{ confirmed: boolean; message: string }> {
  const db = getDb();
  const payment = db.prepare(`
    SELECT * FROM payments WHERE id = ? AND user_id = ?
  `).get(paymentId, userId) as IPaymentRecord | undefined;

  if (!payment) return { confirmed: false, message: 'Платёж не найден.' };
  if (payment.status === 'confirmed') return { confirmed: true, message: 'Платёж уже подтверждён ранее.' };
  if (payment.status === 'failed') return { confirmed: false, message: 'Платёж отклонён.' };

  const { terminalKey, password } = getCredentials();
  const token = generateToken(password, {
    TerminalKey: terminalKey,
    PaymentId: payment.tinkoff_payment_id,
  });

  try {
    const { data } = await axios.post<TinkoffGetStateResponse>(`${API_URL}/v2/GetState/`, {
      TerminalKey: terminalKey,
      PaymentId: payment.tinkoff_payment_id,
      Token: token,
    });

    if (data.Success && data.Status === 'CONFIRMED') {
      const pkg = PACKAGES.find((p) => p.key === payment.package_key);
      if (pkg) {
        addPaidRequests(userId, pkg.requests);
      }
      db.prepare(`UPDATE payments SET status = 'confirmed' WHERE id = ?`).run(paymentId);

      return {
        confirmed: true,
        message: `✅ Оплата подтверждена!\nПакет «${pkg?.label}» активирован — ${pkg?.requests} запросов добавлено.`,
      };
    }

    if (data.Status === 'REJECTED' || data.Status === 'CANCELED' || data.Status === 'REVERSED') {
      db.prepare(`UPDATE payments SET status = 'failed' WHERE id = ?`).run(paymentId);
      return { confirmed: false, message: `❌ Платёж отклонён (${data.Status}).` };
    }

    return { confirmed: false, message: `⏳ Статус платежа: ${data.Status}. Попробуйте позже.` };
  } catch (err: any) {
    console.error('[TINKOFF] CheckPayment error:', err?.message ?? err, err?.response?.data ?? '');
    return { confirmed: false, message: '❌ Ошибка при проверке платежа. Попробуйте позже.' };
  }
}
