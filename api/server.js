import 'dotenv/config';
import { createServer } from 'node:http';
import { randomUUID, timingSafeEqual } from 'node:crypto';
import express from 'express';
import { openDatabase } from './database.js';

const port = Number(process.env.PORT || 3001);
const { db, databasePath } = openDatabase();

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
    id, candidate_id, test_key, test_type, submitted_at,
    score_percent, score_correct, score_total, auto_submitted,
    answers_json, aptitude_report_json, payload_json, created_at
  ) VALUES (
    @id, @candidate_id, @test_key, @test_type, @submitted_at,
    @score_percent, @score_correct, @score_total, @auto_submitted,
    @answers_json, @aptitude_report_json, @payload_json, @created_at
  )
`);
const saveResult = db.transaction((payload) => {
  const now = new Date().toISOString();
  const email = payload.candidateEmail.trim().toLowerCase();
  upsertCandidate.run({
    id: randomUUID(),
    email,
    full_name: payload.candidateName.trim(),
    school: payload.candidateSchool.trim(),
    course: payload.candidateCourse.trim(),
    phone: payload.candidatePhone.trim(),
    now,
  });
  const candidate = getCandidate.get(email);
  const resultId = randomUUID();
  const aptitudeReport = payload.testType === 'aptitude' ? createAptitudeReport(payload.answers) : null;
  insertResult.run({
    id: resultId,
    candidate_id: candidate.id,
    test_key: payload.testKey,
    test_type: payload.testType,
    submitted_at: new Date(payload.submittedAtISO).toISOString(),
    score_percent: payload.score.percent,
    score_correct: payload.score.correct,
    score_total: payload.score.total,
    auto_submitted: payload.autoSubmitted ? 1 : 0,
    answers_json: JSON.stringify(payload.answers),
    aptitude_report_json: aptitudeReport ? JSON.stringify(aptitudeReport) : null,
    payload_json: JSON.stringify(payload),
    created_at: now,
  });
  return resultId;
});

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '64kb', strict: true }));

app.get('/api/health', (_request, response) => {
  response.json({ ok: true });
});

app.post('/api/results', (request, response) => {
  const validationError = validatePayload(request.body);
  if (validationError) return response.status(400).json({ error: validationError });

  try {
    const id = saveResult(request.body);
    return response.status(201).json({ ok: true, id });
  } catch (error) {
    if (error?.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return response.status(409).json({ error: 'This test submission has already been recorded.' });
    }
    console.error('Could not save assessment result:', error);
    return response.status(500).json({ error: 'Could not save assessment result.' });
  }
});

app.get('/api/admin/results', (request, response) => {
  if (!isAuthorized(request.get('authorization'))) {
    return response.status(process.env.ADMIN_TOKEN ? 401 : 503).json({
      error: process.env.ADMIN_TOKEN ? 'Admin authentication required.' : 'Admin access is disabled until ADMIN_TOKEN is configured.',
    });
  }

  const requestedLimit = Number.parseInt(String(request.query.limit || '500'), 10);
  const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 1000) : 500;
  const rows = db.prepare(`
    SELECT
      r.id,
      r.test_key,
      r.test_type,
      c.email AS candidate_email,
      c.full_name AS candidate_name,
      r.submitted_at,
      r.score_percent,
      r.score_correct,
      r.score_total,
      r.auto_submitted
    FROM assessment_results r
    JOIN candidates c ON c.id = r.candidate_id
    ORDER BY r.submitted_at DESC
    LIMIT ?
  `).all(limit);
  return response.json({ rows });
});

app.use((error, _request, response, _next) => {
  if (error?.type === 'entity.parse.failed') {
    return response.status(400).json({ error: 'Request body must contain valid JSON.' });
  }
  if (error?.type === 'entity.too.large') {
    return response.status(413).json({ error: 'Request body is too large.' });
  }
  console.error('Unhandled API error:', error);
  return response.status(500).json({ error: 'Internal server error.' });
});

const server = createServer(app);
server.listen(port, '127.0.0.1', () => {
  console.log(`MATTA API listening on http://127.0.0.1:${port}`);
  console.log(`SQLite database: ${databasePath}`);
});

function validatePayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return 'Request body must be an object.';
  const requiredText = [
    ['testKey', 100], ['candidateEmail', 254], ['candidateName', 160],
    ['candidateSchool', 200], ['candidateCourse', 160], ['candidatePhone', 60],
  ];
  for (const [field, maxLength] of requiredText) {
    if (typeof payload[field] !== 'string' || !payload[field].trim() || payload[field].length > maxLength) {
      return `${field} is required and must be no longer than ${maxLength} characters.`;
    }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.candidateEmail.trim())) return 'candidateEmail must be a valid email address.';
  if (!['iq', 'english', 'aptitude'].includes(payload.testType)) return 'testType must be iq, english, or aptitude.';
  if (typeof payload.submittedAtISO !== 'string' || !Number.isFinite(Date.parse(payload.submittedAtISO))) {
    return 'submittedAtISO must be a valid date.';
  }
  const score = payload.score;
  if (!score || !Number.isInteger(score.correct) || !Number.isInteger(score.total) || !Number.isInteger(score.percent)) {
    return 'score must contain integer correct, total, and percent values.';
  }
  if (score.total < 1 || score.total > 100 || score.correct < 0 || score.correct > score.total || score.percent !== Math.round((score.correct / score.total) * 100)) {
    return 'score values are outside the accepted range or inconsistent.';
  }
  if (!payload.answers || typeof payload.answers !== 'object' || Array.isArray(payload.answers) || Object.keys(payload.answers).length > 100) {
    return 'answers must be an object containing at most 100 answers.';
  }
  for (const [questionId, answer] of Object.entries(payload.answers)) {
    if (questionId.length > 64 || !Number.isInteger(answer) || answer < 0 || answer > 10) {
      return 'Each answer must have a short question ID and an integer choice from 0 to 10.';
    }
  }
  if (typeof payload.autoSubmitted !== 'boolean') return 'autoSubmitted must be a boolean.';
  return null;
}

function isAuthorized(header) {
  const expected = process.env.ADMIN_TOKEN || '';
  const supplied = typeof header === 'string' ? header.replace(/^Bearer\s+/i, '') : '';
  if (!expected || !supplied) return false;
  const expectedBuffer = Buffer.from(expected);
  const suppliedBuffer = Buffer.from(supplied);
  return expectedBuffer.length === suppliedBuffer.length && timingSafeEqual(expectedBuffer, suppliedBuffer);
}

function createAptitudeReport(answers) {
  const dimensions = {
    conscientiousness: ['p01', 'p02', 'p03'],
    extraversion: ['p04', 'p05', 'p06'],
    agreeableness: ['p07', 'p08', 'p09'],
    emotional_stability: ['p10', 'p11', 'p12'],
    openness: ['p13', 'p14', 'p15'],
  };
  const reverseIds = new Set(['p03', 'p06', 'p09', 'p12', 'p15']);
  const personality = Object.fromEntries(Object.entries(dimensions).map(([dimension, ids]) => {
    const scores = ids.filter((id) => Number.isInteger(answers[id])).map((id) => reverseIds.has(id) ? 4 - answers[id] : answers[id]);
    const average = scores.length ? scores.reduce((sum, value) => sum + value, 0) / scores.length : 2;
    return [dimension, Math.round((average / 4) * 100)];
  }));
  return { personality };
}
