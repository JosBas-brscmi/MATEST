PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS candidates (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL COLLATE NOCASE UNIQUE,
  full_name TEXT NOT NULL,
  school TEXT NOT NULL,
  course TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS custom_quizzes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes BETWEEN 1 AND 240),
  questions_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS builtin_assessments (
  test_key TEXT PRIMARY KEY CHECK (test_key IN ('iq', 'english', 'aptitude')),
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1))
);

CREATE TABLE IF NOT EXISTS assessment_results (
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

CREATE INDEX IF NOT EXISTS idx_results_submitted_at
  ON assessment_results (submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_results_candidate_type_date
  ON assessment_results (candidate_id, test_type, submitted_at DESC);
