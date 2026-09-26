import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { openDatabase } from '../api/database.js';

const inputPath = process.argv[2];
if (!inputPath) {
  console.error('Usage: node scripts/import-legacy-results.js <exported-results.json>');
  process.exit(1);
}

const parsed = JSON.parse(readFileSync(resolve(inputPath), 'utf8'));
const rows = Array.isArray(parsed) ? parsed : parsed.rows;
if (!Array.isArray(rows)) throw new Error('Expected a JSON array of legacy result rows.');

const normalized = rows.map((row, index) => {
  let payload = row.payload_json ?? row.payload ?? {};
  if (typeof payload === 'string') payload = JSON.parse(payload || '{}');
  const score = payload.score ?? {
    correct: row.score_correct,
    total: row.score_total,
    percent: row.score_percent,
  };
  const record = {
    testKey: String(row.test_key ?? payload.testKey ?? ''),
    testType: String(row.test_type ?? payload.testType ?? '').toLowerCase(),
    candidateEmail: String(row.candidate_email ?? payload.candidateEmail ?? '').trim().toLowerCase(),
    candidateName: String(row.candidate_name ?? payload.candidateName ?? 'Unknown candidate'),
    candidateSchool: String(row.candidate_school ?? payload.candidateSchool ?? '—'),
    candidateCourse: String(row.candidate_course ?? payload.candidateCourse ?? '—'),
    candidatePhone: String(row.candidate_phone ?? payload.candidatePhone ?? '—'),
    submittedAtISO: String(row.submitted_at ?? payload.submittedAtISO ?? ''),
    score,
    answers: payload.answers && typeof payload.answers === 'object' ? payload.answers : {},
    autoSubmitted: Boolean(row.auto_submitted ?? payload.autoSubmitted ?? false),
    legacyId: String(row.id ?? randomUUID()),
  };
  const validScore = record.score
    && Number.isInteger(record.score.correct)
    && Number.isInteger(record.score.total)
    && Number.isInteger(record.score.percent)
    && record.score.total > 0
    && record.score.correct >= 0
    && record.score.correct <= record.score.total
    && record.score.percent === Math.round(record.score.correct / record.score.total * 100);
  if (!record.testKey || !['iq', 'english', 'aptitude'].includes(record.testType)
      || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.candidateEmail)
      || !Number.isFinite(Date.parse(record.submittedAtISO)) || !validScore) {
    throw new Error(`Legacy row ${index + 1} is missing valid test, candidate, date, or score fields.`);
  }
  return record;
});

const { db } = openDatabase();
const existing = db.prepare('SELECT 1 FROM assessment_results WHERE test_key = ?');
const upsertCandidate = db.prepare(`
  INSERT INTO candidates (id, email, full_name, school, course, phone, created_at, updated_at)
  VALUES (@id, @email, @full_name, @school, @course, @phone, @now, @now)
  ON CONFLICT(email) DO UPDATE SET
    full_name = excluded.full_name,
    school = excluded.school,
    course = excluded.course,
    phone = excluded.phone,
    updated_at = excluded.updated_at
`);
const getCandidate = db.prepare('SELECT id FROM candidates WHERE email = ?');
const insertResult = db.prepare(`
  INSERT INTO assessment_results (
    id, candidate_id, test_key, test_type, submitted_at, score_percent,
    score_correct, score_total, auto_submitted, answers_json,
    aptitude_report_json, payload_json, created_at
  ) VALUES (
    @id, @candidate_id, @test_key, @test_type, @submitted_at, @score_percent,
    @score_correct, @score_total, @auto_submitted, @answers_json,
    NULL, @payload_json, @created_at
  )
`);
let imported = 0;
let skipped = 0;
const importRows = db.transaction(() => {
  for (const row of normalized) {
    if (existing.get(row.testKey)) {
      skipped++;
      continue;
    }
    const now = new Date().toISOString();
    upsertCandidate.run({
      id: randomUUID(),
      email: row.candidateEmail,
      full_name: row.candidateName,
      school: row.candidateSchool,
      course: row.candidateCourse,
      phone: row.candidatePhone,
      now,
    });
    const candidate = getCandidate.get(row.candidateEmail);
    const payload = {
      testKey: row.testKey,
      testType: row.testType,
      candidateEmail: row.candidateEmail,
      candidateName: row.candidateName,
      candidateSchool: row.candidateSchool,
      candidateCourse: row.candidateCourse,
      candidatePhone: row.candidatePhone,
      submittedAtISO: new Date(row.submittedAtISO).toISOString(),
      score: row.score,
      answers: row.answers,
      autoSubmitted: row.autoSubmitted,
    };
    insertResult.run({
      id: row.legacyId,
      candidate_id: candidate.id,
      test_key: row.testKey,
      test_type: row.testType,
      submitted_at: payload.submittedAtISO,
      score_percent: row.score.percent,
      score_correct: row.score.correct,
      score_total: row.score.total,
      auto_submitted: row.autoSubmitted ? 1 : 0,
      answers_json: JSON.stringify(row.answers),
      payload_json: JSON.stringify(payload),
      created_at: now,
    });
    imported++;
  }
});

importRows();
console.log(`Imported ${imported} results; skipped ${skipped} existing test keys.`);
db.close();
