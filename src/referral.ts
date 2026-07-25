import { Bot } from '@maxhub/max-bot-api';
import { getDb } from './database';

export interface IUserRecord {
  user_id: number;
  phone: string | null;
  name: string | null;
  subscribed: number;
  agreement_accepted: number;
  agreement_accepted_at: string | null;
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

export function hasAgreement(userId: number): boolean {
  const db = getDb();
  const row = db.prepare('SELECT agreement_accepted FROM users WHERE user_id = ?').get(userId) as { agreement_accepted: number } | undefined;
  return row ? row.agreement_accepted === 1 : false;
}

export function setAgreement(userId: number): void {
  const db = getDb();
  db.prepare(`
    UPDATE users SET agreement_accepted = 1, agreement_accepted_at = datetime('now', 'localtime')
    WHERE user_id = ?
  `).run(userId);
  console.log(`[AGREEMENT] userId=${userId} agreement_accepted=1`);
}

export function registerUser(userId: number, phone: string, name: string | null): void {
  const db = getDb();
  db.prepare(`
    INSERT OR IGNORE INTO users (user_id, phone, name, registered_at)
    VALUES (?, ?, ?, datetime('now', 'localtime'))
  `).run(userId, phone, name);

  db.prepare(`
    INSERT OR IGNORE INTO user_balance (user_id, free_requests, created_at, updated_at)
    VALUES (?, 10, datetime('now', 'localtime'), datetime('now', 'localtime'))
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
      query: { user_ids: String(userId) },
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
  if (existing) {
    console.log(`[REFERRAL] skip: referredId=${referredId} already has a referrer`);
    return false;
  }

  if (referrerId === referredId) {
    console.log(`[REFERRAL] skip: userId=${referrerId} self-referral`);
    return false;
  }

  const referrerExists = db.prepare('SELECT 1 FROM users WHERE user_id = ?').get(referrerId);
  if (!referrerExists) {
    console.log(`[REFERRAL] skip: referrerId=${referrerId} not found in users`);
    return false;
  }

  const referredExists = db.prepare('SELECT 1 FROM users WHERE user_id = ?').get(referredId);
  if (!referredExists) {
    console.log(`[REFERRAL] skip: referredId=${referredId} not found in users`);
    return false;
  }

  const grantBonus = db.transaction(() => {
    db.prepare(`
      INSERT INTO referrals (referrer_id, referred_id, bonus_granted, created_at)
      VALUES (?, ?, 1, datetime('now', 'localtime'))
    `).run(referrerId, referredId);

    db.prepare(`
      UPDATE user_balance SET free_requests = free_requests + 3, updated_at = datetime('now', 'localtime')
      WHERE user_id = ?
    `).run(referrerId);

    db.prepare(`
      UPDATE user_balance SET free_requests = free_requests + 3, updated_at = datetime('now', 'localtime')
      WHERE user_id = ?
    `).run(referredId);
  });

  grantBonus();

  console.log(`[REFERRAL] bonus granted referrerId=${referrerId} referredId=${referredId}`);
  return true;
}
