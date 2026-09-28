import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export function openDatabase() {
  const databasePath = resolve(projectRoot, process.env.DB_PATH || 'database/trial.db');
  mkdirSync(dirname(databasePath), { recursive: true });
  const db = new Database(databasePath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 5000');
  const schema = readFileSync(resolve(projectRoot, 'database/schema.sql'), 'utf8');
  db.exec(schema);
  return { db, databasePath };
}
