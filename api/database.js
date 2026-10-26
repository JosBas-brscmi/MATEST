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
  migrateCustomQuizResults(db);
  return { db, databasePath };
}

function migrateCustomQuizResults(db) {
  const columns = db.pragma('table_info(assessment_results)');
  const table = db.prepare(`
    SELECT sql FROM sqlite_master
    WHERE type = 'table' AND name = 'assessment_results'
  `).get();
  const hasQuizColumn = columns.some((column) => column.name === 'custom_quiz_id');
  const supportsCustomType = table?.sql?.includes("'custom'");
  const quizForeignKey = db.pragma('foreign_key_list(assessment_results)')
    .find((foreignKey) => foreignKey.table === 'custom_quizzes' && foreignKey.from === 'custom_quiz_id');
  const preservesQuizResults = quizForeignKey?.on_delete === 'SET NULL';
  if (hasQuizColumn && supportsCustomType && preservesQuizResults) return;
  const quizIdColumn = hasQuizColumn ? 'custom_quiz_id, ' : '';

  db.transaction(() => {
    db.exec(`
      ALTER TABLE assessment_results RENAME TO assessment_results_legacy;

      CREATE TABLE assessment_results (
        id TEXT PRIMARY KEY,
        candidate_id TEXT NOT NULL REFERENCES candidates(id) ON DELETE RESTRICT,
        custom_quiz_id TEXT REFERENCES custom_quizzes(id) ON DELETE SET NULL,
        test_key TEXT NOT NULL UNIQUE,
        test_type TEXT NOT NULL CHECK (test_type IN ('iq', 'english', 'aptitude', 'custom')),
        submitted_at TEXT NOT NULL,
        score_percent INTEGER NOT NULL CHECK (score_percent BETWEEN 0 AND 100),
        score_correct INTEGER NOT NULL CHECK (score_correct >= 0),
        score_total INTEGER NOT NULL CHECK (score_total > 0),
        auto_submitted INTEGER NOT NULL DEFAULT 0 CHECK (auto_submitted IN (0, 1)),
        answers_json TEXT NOT NULL,
        aptitude_report_json TEXT,
        payload_json TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      INSERT INTO assessment_results (
        id, candidate_id, ${quizIdColumn}test_key, test_type, submitted_at,
        score_percent, score_correct, score_total, auto_submitted,
        answers_json, aptitude_report_json, payload_json, created_at
      )
      SELECT
        id, candidate_id, ${quizIdColumn}test_key, test_type, submitted_at,
        score_percent, score_correct, score_total, auto_submitted,
        answers_json, aptitude_report_json, payload_json, created_at
      FROM assessment_results_legacy;

      DROP TABLE assessment_results_legacy;

      CREATE INDEX IF NOT EXISTS idx_results_submitted_at
        ON assessment_results (submitted_at DESC);
      CREATE INDEX IF NOT EXISTS idx_results_candidate_type_date
        ON assessment_results (candidate_id, test_type, submitted_at DESC);
    `);
  })();
}
