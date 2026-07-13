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
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_balance (
      user_id                INTEGER PRIMARY KEY,
      free_requests          INTEGER NOT NULL DEFAULT 3,
      paid_requests_remaining INTEGER NOT NULL DEFAULT 0,
      paid_requests_expiry   INTEGER,
      created_at             TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at             TEXT NOT NULL DEFAULT (datetime('now'))
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
      created_at        TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS payments (
      id                 INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id            INTEGER NOT NULL,
      package_key        TEXT NOT NULL,
      amount             INTEGER NOT NULL,
      tinkoff_payment_id TEXT NOT NULL,
      tinkoff_order_id   TEXT NOT NULL UNIQUE,
      status             TEXT NOT NULL DEFAULT 'pending',
      created_at         TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}
