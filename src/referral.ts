import { Bot } from '@maxhub/max-bot-api';
import { getDb } from './database';

export interface IUserRecord {
  user_id: number;
  phone: string | null;
  name: string | null;
  subscribed: number;
  registered_at: string;
}

export interface IReferralStats {
  total: number;
}

export function isUserRegistered(userId: number): boolean {
  const db = getDb();
  const row = db.prepare('SELECT 1 FROM users WHERE user_id = ? AND phone IS NOT NULL AND name IS NOT NULL').get(userId);
  return !!row;
}

export function registerUser(userId: number, phone: string, name: string | null): void {
  const db = getDb();
  db.prepare(`
    INSERT OR IGNORE INTO users (user_id, phone, name)
    VALUES (?, ?, ?)
  `).run(userId, phone, name);

  db.prepare(`
    INSERT OR IGNORE INTO user_balance (user_id, free_requests)
    VALUES (?, 3)
  `).run(userId);

  console.log(`[REGISTER] userId=${userId} phone=${phone} name=${name}`);
}

export function getReferralCode(userId: number): string {
  return String(userId);
}

export function getReferralStats(userId: number): IReferralStats {
  const db = getDb();
  const row = db.prepare(`
    SELECT COUNT(*) as total FROM referrals WHERE referrer_id = ?
  `).get(userId) as { total: number };
  return { total: row.total };
}

export async function isSubscribedToChannel(userId: number, channelId: string, bot: Bot): Promise<boolean> {
  try {
    const response = await (bot.api.raw as any).get(`chats/${channelId}/members`, {
      query: { user_id: userId },
    });
    const found = response?.members?.some((m: any) => m.user_id === userId) === true;
    console.log(`[CHANNEL CHECK] userId=${userId} channelId=${channelId} found=${found}`);
    return found;
  } catch (err: any) {
    console.error(`[CHANNEL CHECK] userId=${userId} channelId=${channelId} ERROR:`, err?.message ?? err, err?.response?.data ?? err?.statusCode ?? '');
    return false;
  }
}

export function updateSubscriptionStatus(userId: number, subscribed: 0 | 1): void {
  const db = getDb();
  db.prepare('UPDATE users SET subscribed = ? WHERE user_id = ?').run(subscribed, userId);
}

export function isUserSubscribed(userId: number): boolean {
  const db = getDb();
  const row = db.prepare('SELECT subscribed FROM users WHERE user_id = ?').get(userId) as { subscribed: number } | undefined;
  return row ? row.subscribed === 1 : false;
}

export function applyReferralBonus(referrerId: number, referredId: number): boolean {
  const db = getDb();

  const existing = db.prepare('SELECT 1 FROM referrals WHERE referred_id = ?').get(referredId);
  if (existing) return false;

  if (referrerId === referredId) return false;

  const referrerExists = db.prepare('SELECT 1 FROM users WHERE user_id = ?').get(referrerId);
  if (!referrerExists) return false;

  const referredExists = db.prepare('SELECT 1 FROM users WHERE user_id = ?').get(referredId);
  if (!referredExists) return false;

  db.prepare(`
    INSERT INTO referrals (referrer_id, referred_id, bonus_granted)
    VALUES (?, ?, 1)
  `).run(referrerId, referredId);

  db.prepare(`
    UPDATE user_balance SET free_requests = free_requests + 3, updated_at = datetime('now')
    WHERE user_id = ?
  `).run(referrerId);

  db.prepare(`
    UPDATE user_balance SET free_requests = free_requests + 3, updated_at = datetime('now')
    WHERE user_id = ?
  `).run(referredId);

  console.log(`[REFERRAL] bonus granted referrerId=${referrerId} referredId=${referredId}`);
  return true;
}
