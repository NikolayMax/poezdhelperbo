import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.resolve(__dirname, '..', 'data', 'bot.db');

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initSchema();
  }
  return db;
}

function initSchema() {
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      user_id               INTEGER PRIMARY KEY,
      phone                 TEXT,
      name                  TEXT,
      subscribed            INTEGER NOT NULL DEFAULT 0,
      agreement_accepted    INTEGER NOT NULL DEFAULT 0,
      agreement_accepted_at TEXT,
      registered_at         TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS user_balance (
      user_id                INTEGER PRIMARY KEY,
      free_requests          INTEGER NOT NULL DEFAULT 10,
      paid_requests_remaining INTEGER NOT NULL DEFAULT 0,
      paid_requests_expiry   INTEGER,
      created_at             TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      updated_at             TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS tracked_trains (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id           INTEGER NOT NULL,
      train_id          INTEGER NOT NULL,
      train_number      TEXT NOT NULL,
      train_name        TEXT NOT NULL,
      date              TEXT NOT NULL,
      departure_time    TEXT NOT NULL,
      arrival_time      TEXT NOT NULL,
      station_from_id   INTEGER NOT NULL,
      station_to_id     INTEGER NOT NULL,
      last_places_count INTEGER,
      notified          INTEGER NOT NULL DEFAULT 0,
      created_at        TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (user_id) REFERENCES users(user_id)
    );

    CREATE TABLE IF NOT EXISTS referrals (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      referrer_id   INTEGER NOT NULL,
      referred_id   INTEGER NOT NULL UNIQUE,
      bonus_granted INTEGER NOT NULL DEFAULT 0,
      created_at    TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (referrer_id) REFERENCES users(user_id),
      FOREIGN KEY (referred_id) REFERENCES users(user_id)
    );

    CREATE TABLE IF NOT EXISTS payments (
      id                 INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id            INTEGER NOT NULL,
      package_key        TEXT NOT NULL,
      amount             INTEGER NOT NULL,
      tinkoff_payment_id TEXT NOT NULL,
      tinkoff_order_id   TEXT NOT NULL UNIQUE,
      status             TEXT NOT NULL DEFAULT 'pending',
      created_at         TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (user_id) REFERENCES users(user_id)
    );
  `);

  migrateExistingUsers();
  migrateAgreementColumns();
}

function migrateExistingUsers() {
  const rows = db.prepare(`
    SELECT ub.user_id FROM user_balance ub
    LEFT JOIN users u ON u.user_id = ub.user_id
    WHERE u.user_id IS NULL
  `).all() as { user_id: number }[];

  const insert = db.prepare(`INSERT OR IGNORE INTO users (user_id) VALUES (?)`);
  for (const row of rows) {
    insert.run(row.user_id);
  }
  if (rows.length > 0) {
    console.log(`[MIGRATE] Created ${rows.length} user records for existing users`);
  }
}

function migrateAgreementColumns() {
  const columns = db.prepare("PRAGMA table_info(users)").all() as { name: string }[];
  const columnNames = columns.map(c => c.name);

  if (!columnNames.includes('agreement_accepted')) {
    db.exec("ALTER TABLE users ADD COLUMN agreement_accepted INTEGER NOT NULL DEFAULT 0");
    console.log('[MIGRATE] Added agreement_accepted column');
  }

  if (!columnNames.includes('agreement_accepted_at')) {
    db.exec("ALTER TABLE users ADD COLUMN agreement_accepted_at TEXT");
    console.log('[MIGRATE] Added agreement_accepted_at column');
  }
}
