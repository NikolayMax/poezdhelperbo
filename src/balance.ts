import { getDb } from './database';

export interface IUserBalance {
  userId: number;
  freeRequests: number;
  paidRequestsRemaining: number;
  paidRequestsExpiry: number | null;
}

export interface IDeductResult {
  success: boolean;
  source: 'free' | 'paid' | null;
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

const INSERT_IF_NOT_EXISTS = `
  INSERT OR IGNORE INTO user_balance (user_id, free_requests)
  VALUES (?, 3)
`;

const SELECT_BALANCE = `
  SELECT user_id, free_requests, paid_requests_remaining, paid_requests_expiry
  FROM user_balance
  WHERE user_id = ?
`;

const UPDATE_PAID = `
  UPDATE user_balance
  SET paid_requests_remaining = ?, paid_requests_expiry = ?, updated_at = datetime('now')
  WHERE user_id = ?
`;

const RESET_PAID = `
  UPDATE user_balance
  SET paid_requests_remaining = 0, paid_requests_expiry = NULL, updated_at = datetime('now')
  WHERE user_id = ?
`;

function rowToBalance(row: { user_id: number; free_requests: number; paid_requests_remaining: number; paid_requests_expiry: number | null }): IUserBalance {
  return {
    userId: row.user_id,
    freeRequests: row.free_requests,
    paidRequestsRemaining: row.paid_requests_remaining,
    paidRequestsExpiry: row.paid_requests_expiry ?? null,
  };
}

function ensureUser(userId: number): void {
  const db = getDb();
  db.prepare(INSERT_IF_NOT_EXISTS).run(userId);
}

export function getBalance(userId: number): IUserBalance {
  const db = getDb();
  ensureUser(userId);
  const row = db.prepare(SELECT_BALANCE).get(userId) as {
    user_id: number; free_requests: number; paid_requests_remaining: number; paid_requests_expiry: number | null;
  } | undefined;

  if (!row) {
    return { userId, freeRequests: 3, paidRequestsRemaining: 0, paidRequestsExpiry: null };
  }

  return rowToBalance(row);
}

export function checkAndExpirePaid(userId: number): void {
  const db = getDb();
  const row = db.prepare(SELECT_BALANCE).get(userId) as {
    paid_requests_expiry: number | null; paid_requests_remaining: number;
  } | undefined;

  if (!row || !row.paid_requests_expiry) return;

  if (Date.now() >= row.paid_requests_expiry) {
    db.prepare(RESET_PAID).run(userId);
  }
}

export function deductRequest(userId: number): IDeductResult {
  const db = getDb();
  ensureUser(userId);

  const freeResult = db.prepare(`
    UPDATE user_balance SET free_requests = free_requests - 1, updated_at = datetime('now')
    WHERE user_id = ? AND free_requests > 0
  `).run(userId);

  if (freeResult.changes > 0) {
    return { success: true, source: 'free' };
  }

  checkAndExpirePaid(userId);

  const paidResult = db.prepare(`
    UPDATE user_balance SET paid_requests_remaining = paid_requests_remaining - 1, updated_at = datetime('now')
    WHERE user_id = ? AND paid_requests_remaining > 0 AND paid_requests_expiry IS NOT NULL AND paid_requests_expiry > ?
  `).run(userId, Date.now());

  if (paidResult.changes > 0) {
    return { success: true, source: 'paid' };
  }

  return { success: false, source: null };
}

export function addPaidRequests(userId: number, count: number): void {
  const db = getDb();
  ensureUser(userId);

  const balance = getBalance(userId);
  const newRemaining = balance.paidRequestsRemaining + count;
  const newExpiry = Date.now() + THIRTY_DAYS_MS;

  db.prepare(UPDATE_PAID).run(newRemaining, newExpiry, userId);
}

export function getTotalAvailable(userId: number): number {
  const balance = getBalance(userId);
  let total = balance.freeRequests;

  if (balance.paidRequestsExpiry && Date.now() < balance.paidRequestsExpiry) {
    total += balance.paidRequestsRemaining;
  }

  return total;
}
