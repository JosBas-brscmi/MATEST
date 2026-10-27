import 'dotenv/config';
import { createServer } from 'node:http';
import { randomUUID, timingSafeEqual } from 'node:crypto';
import express from 'express';
import { openDatabase } from './database.js';

const port = Number(process.env.PORT || 3001);
const { db, databasePath } = openDatabase();
const ADMIN_MAX_FAILED_ATTEMPTS = 4;
const ADMIN_ATTEMPT_WINDOW_MS = 60 * 60 * 1000;
const ADMIN_LOCKOUT_MS = 60 * 60 * 1000;
const failedAdminAttempts = new Map();
const BUILTIN_ASSESSMENTS = [
  { key: 'iq', title: 'IQ Assessment', durationMinutes: 30, questionCount: 25 },
  { key: 'english', title: 'English Assessment', durationMinutes: 25, questionCount: 25 },
  { key: 'aptitude', title: 'Aptitude & Personality', durationMinutes: 18, questionCount: 30 },
];

const seedBuiltinAssessment = db.prepare(`
  INSERT OR IGNORE INTO builtin_assessments (test_key, is_active)
  VALUES (?, 1)
`);
for (const assessment of BUILTIN_ASSESSMENTS) seedBuiltinAssessment.run(assessment.key);

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
    id, candidate_id, custom_quiz_id, test_key, test_type, submitted_at,
    score_percent, score_correct, score_total, auto_submitted,
    answers_json, aptitude_report_json, payload_json, created_at
  ) VALUES (
    @id, @candidate_id, @custom_quiz_id, @test_key, @test_type, @submitted_at,
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
    custom_quiz_id: payload.customQuizId || null,
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
app.set('trust proxy', 'loopback');
app.use(express.json({ limit: '1mb', strict: true }));

app.get('/api/health', (_request, response) => {
  response.json({ ok: true });
});

app.get('/api/assessments', (_request, response) => {
  const activeKeys = new Set(db.prepare(`
    SELECT test_key FROM builtin_assessments WHERE is_active = 1
  `).all().map((row) => row.test_key));
  const assessments = BUILTIN_ASSESSMENTS
    .filter((assessment) => activeKeys.has(assessment.key))
    .map((assessment) => ({ ...assessment, id: `builtin-${assessment.key}` }));
  return response.json({ assessments });
});

app.get('/api/quizzes', (_request, response) => {
  const quizzes = db.prepare(`
    SELECT id, title, duration_minutes, questions_json
    FROM custom_quizzes
    ORDER BY created_at DESC
  `).all().map((quiz) => ({
    id: quiz.id,
    title: quiz.title,
    durationMinutes: quiz.duration_minutes,
    questionCount: JSON.parse(quiz.questions_json).length,
  }));
  return response.json({ quizzes });
});

app.get('/api/quizzes/:quizId', (request, response) => {
  const quiz = db.prepare(`
    SELECT id, title, duration_minutes, questions_json
    FROM custom_quizzes
    WHERE id = ?
  `).get(request.params.quizId);
  if (!quiz) return response.status(404).json({ error: 'Quiz not found.' });
  const questions = JSON.parse(quiz.questions_json).map((question) => {
    const publicQuestion = { ...question };
    delete publicQuestion.answerIndex;
    return publicQuestion;
  });
  return response.json({
    id: quiz.id,
    title: quiz.title,
    durationMinutes: quiz.duration_minutes,
    questions,
  });
});

app.get('/api/admin/quizzes', requireAdmin, (_request, response) => {
  const customQuizzes = db.prepare(`
    SELECT id, title, duration_minutes, questions_json
    FROM custom_quizzes
    ORDER BY created_at DESC
  `).all().map((quiz) => ({
    id: quiz.id,
    title: quiz.title,
    durationMinutes: quiz.duration_minutes,
    questionCount: JSON.parse(quiz.questions_json).length,
    kind: 'custom',
    isActive: true,
  }));
  const activeBuiltinKeys = new Set(db.prepare(`
    SELECT test_key FROM builtin_assessments WHERE is_active = 1
  `).all().map((row) => row.test_key));
  const builtinQuizzes = BUILTIN_ASSESSMENTS.map((assessment) => ({
    id: `builtin-${assessment.key}`,
    title: assessment.title,
    durationMinutes: assessment.durationMinutes,
    questionCount: assessment.questionCount,
    kind: 'builtin',
    isActive: activeBuiltinKeys.has(assessment.key),
  }));
  const quizzes = [...builtinQuizzes, ...customQuizzes];
  return response.json({ quizzes });
});

app.patch('/api/admin/assessments/:testKey', requireAdmin, (request, response) => {
  const assessment = BUILTIN_ASSESSMENTS.find((item) => item.key === request.params.testKey);
  if (!assessment) return response.status(404).json({ error: 'Built-in assessment not found.' });
  if (typeof request.body?.isActive !== 'boolean') {
    return response.status(400).json({ error: 'isActive must be a boolean.' });
  }
  db.prepare('UPDATE builtin_assessments SET is_active = ? WHERE test_key = ?')
    .run(request.body.isActive ? 1 : 0, assessment.key);
  return response.json({ ok: true, isActive: request.body.isActive });
});

app.get('/api/admin/quizzes/:quizId', requireAdmin, (request, response) => {
  const quiz = db.prepare(`
    SELECT id, title, duration_minutes, questions_json
    FROM custom_quizzes
    WHERE id = ?
  `).get(request.params.quizId);
  if (!quiz) return response.status(404).json({ error: 'Quiz not found.' });
  return response.json({
    id: quiz.id,
    title: quiz.title,
    durationMinutes: quiz.duration_minutes,
    questions: JSON.parse(quiz.questions_json),
  });
});

app.post('/api/admin/quizzes', requireAdmin, (request, response) => {
  const validationError = validateCustomQuiz(request.body);
  if (validationError) return response.status(400).json({ error: validationError });

  const id = randomUUID();
  const createdAt = new Date().toISOString();
  db.prepare(`
    INSERT INTO custom_quizzes (id, title, duration_minutes, questions_json, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, request.body.title.trim(), request.body.durationMinutes, JSON.stringify(request.body.questions), createdAt);
  return response.status(201).json({ id });
});

app.put('/api/admin/quizzes/:quizId', requireAdmin, (request, response) => {
  const validationError = validateCustomQuiz(request.body);
  if (validationError) return response.status(400).json({ error: validationError });

  const result = db.prepare(`
    UPDATE custom_quizzes
    SET title = ?, duration_minutes = ?, questions_json = ?
    WHERE id = ?
  `).run(request.body.title.trim(), request.body.durationMinutes, JSON.stringify(request.body.questions), request.params.quizId);
  if (!result.changes) return response.status(404).json({ error: 'Quiz not found.' });
  return response.json({ ok: true });
});

app.delete('/api/admin/quizzes/:quizId', requireAdmin, (request, response) => {
  const result = db.prepare('DELETE FROM custom_quizzes WHERE id = ?').run(request.params.quizId);
  if (!result.changes) return response.status(404).json({ error: 'Quiz not found.' });
  return response.json({ ok: true });
});

app.post('/api/results', (request, response) => {
  const validationError = validatePayload(request.body);
  if (validationError) return response.status(400).json({ error: validationError });

  if (['iq', 'english', 'aptitude'].includes(request.body.testType)) {
    const assessment = db.prepare('SELECT is_active FROM builtin_assessments WHERE test_key = ?')
      .get(request.body.testType);
    if (!assessment?.is_active) {
      return response.status(400).json({ error: 'This assessment is not currently available.' });
    }
  }

  if (request.body.testType === 'custom') {
    const quiz = db.prepare('SELECT questions_json FROM custom_quizzes WHERE id = ?').get(request.body.customQuizId);
    if (!quiz) return response.status(400).json({ error: 'The custom quiz could not be found.' });
    const questions = JSON.parse(quiz.questions_json);
    const scoredQuestions = questions.filter((question) => question.type !== 'likert');
    const correct = scoredQuestions.filter((question) => request.body.answers[question.id] === question.answerIndex).length;
    request.body.score = {
      correct,
      total: scoredQuestions.length,
      percent: Math.round((correct / scoredQuestions.length) * 100),
    };
  }

  try {
    const id = saveResult(request.body);
    return response.status(201).json({
      ok: true,
      id,
      ...(request.body.testType === 'custom' ? { score: request.body.score } : {}),
    });
  } catch (error) {
    if (error?.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return response.status(409).json({ error: 'This test submission has already been recorded.' });
    }
    console.error('Could not save assessment result:', error);
    return response.status(500).json({ error: 'Could not save assessment result.' });
  }
});

app.get('/api/admin/results', requireAdmin, (request, response) => {
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
      r.auto_submitted,
      COALESCE(json_extract(r.payload_json, '$.testTitle'), q.title) AS custom_quiz_title
    FROM assessment_results r
    JOIN candidates c ON c.id = r.candidate_id
    LEFT JOIN custom_quizzes q ON q.id = r.custom_quiz_id
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
  if (!['iq', 'english', 'aptitude', 'custom'].includes(payload.testType)) return 'testType must be iq, english, aptitude, or custom.';
  if (payload.testType === 'custom' && (typeof payload.customQuizId !== 'string' || !payload.customQuizId)) {
    return 'customQuizId is required for custom quizzes.';
  }
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

function validateCustomQuiz(quiz) {
  if (!quiz || typeof quiz !== 'object' || Array.isArray(quiz)) return 'Quiz must be an object.';
  if (typeof quiz.title !== 'string' || !quiz.title.trim() || quiz.title.length > 120) {
    return 'Quiz title is required and must not exceed 120 characters.';
  }
  if (!Number.isInteger(quiz.durationMinutes) || quiz.durationMinutes < 1 || quiz.durationMinutes > 240) {
    return 'Quiz duration must be an integer between 1 and 240 minutes.';
  }
  if (!Array.isArray(quiz.questions) || quiz.questions.length < 1 || quiz.questions.length > 100) {
    return 'Quiz must contain between 1 and 100 questions.';
  }
  const questionIds = new Set();
  let scoredQuestionCount = 0;
  const questionTypes = [
    'number_series', 'logical_reasoning', 'verbal_analogy', 'figure_reasoning',
    'grammar', 'vocabulary', 'reading', 'sentence_completion',
    'error_identification', 'likert', 'custom',
  ];
  for (const question of quiz.questions) {
    if (!question || typeof question !== 'object' || Array.isArray(question)) return 'Each question must be an object.';
    if (typeof question.id !== 'string' || !question.id || question.id.length > 64 || questionIds.has(question.id)) {
      return 'Each question must have a unique ID no longer than 64 characters.';
    }
    questionIds.add(question.id);
    if (!questionTypes.includes(question.type)) return 'Each question must use a supported question type.';
    if (typeof question.prompt !== 'string' || !question.prompt.trim() || question.prompt.length > 4000) {
      return 'Each question needs text no longer than 4,000 characters.';
    }
    if (typeof question.categoryLabel !== 'string' || !question.categoryLabel.trim() || question.categoryLabel.length > 60) {
      return 'Each question needs a type label no longer than 60 characters.';
    }
    if (question.title !== undefined && (typeof question.title !== 'string' || question.title.length > 100)) {
      return 'Question titles must not exceed 100 characters.';
    }
    if (question.passage !== undefined && (typeof question.passage !== 'string' || question.passage.length > 10000)) {
      return 'Passages must not exceed 10,000 characters.';
    }
    if (question.passageTitle !== undefined && (typeof question.passageTitle !== 'string' || question.passageTitle.length > 100)) {
      return 'Passage titles must not exceed 100 characters.';
    }
    if (question.containerColor !== undefined && !/^#[\da-f]{6}$/i.test(question.containerColor)) {
      return 'Question container colors must be six-digit hex colors.';
    }
    const isLikert = question.type === 'likert';
    const choiceCount = isLikert ? 5 : 4;
    if (
      !Array.isArray(question.choices)
      || question.choices.length !== choiceCount
      || question.choices.some((choice) => typeof choice !== 'string' || !choice.trim() || choice.length > 500)
    ) {
      return `Each ${isLikert ? 'Likert' : 'scored'} question must have ${choiceCount} non-empty choices.`;
    }
    if (isLikert) {
      if (question.answerIndex !== -1) return 'Likert questions must not have a correct answer.';
    } else {
      scoredQuestionCount += 1;
      if (!Number.isInteger(question.answerIndex) || question.answerIndex < 0 || question.answerIndex > 3) {
        return 'Each scored question must specify a correct answer from A to D.';
      }
    }
  }
  if (!scoredQuestionCount) return 'A quiz must contain at least one scored question.';
  if (Buffer.byteLength(JSON.stringify(quiz)) > 900_000) return 'Quiz content is too large.';
  return null;
}

function requireAdmin(request, response, next) {
  if (!process.env.ADMIN_PASSWORD) {
    return response.status(503).json({
      error: 'Admin access is disabled until ADMIN_PASSWORD is configured.',
    });
  }

  const clientAddress = request.ip;
  const lockout = getAdminLockout(clientAddress);
  if (lockout) {
    response.set('Retry-After', String(lockout.retryAfterSeconds));
    return response.status(429).json({
      error: `Too many failed password attempts. Try again in ${lockout.retryAfterSeconds} seconds.`,
    });
  }

  if (!isAuthorized(request.get('x-admin-password'))) {
    const suppliedPassword = request.get('x-admin-password');
    if (!suppliedPassword) return response.status(401).json({ error: 'Admin password is required.' });
    const failedAttempts = recordAdminPasswordFailure(clientAddress);
    if (failedAttempts.lockout) {
      response.set('Retry-After', String(failedAttempts.lockout.retryAfterSeconds));
      return response.status(429).json({
        error: `Too many failed password attempts. Try again in ${failedAttempts.lockout.retryAfterSeconds} seconds.`,
      });
    }
    return response.status(401).json({
      error: `Admin password is incorrect. ${ADMIN_MAX_FAILED_ATTEMPTS - failedAttempts.attempts} attempt(s) remaining before a one-hour lockout.`,
    });
  }

  failedAdminAttempts.delete(clientAddress);
  return next();
}

function isAuthorized(supplied) {
  const expected = process.env.ADMIN_PASSWORD || '';
  if (typeof supplied !== 'string') return false;
  if (!expected || !supplied) return false;
  const expectedBuffer = Buffer.from(expected);
  const suppliedBuffer = Buffer.from(supplied);
  return expectedBuffer.length === suppliedBuffer.length && timingSafeEqual(expectedBuffer, suppliedBuffer);
}

function getAdminLockout(clientAddress, now = Date.now()) {
  for (const [address, attempts] of failedAdminAttempts) {
    const expiresAt = attempts.lockedUntil || attempts.windowStartedAt + ADMIN_ATTEMPT_WINDOW_MS;
    if (expiresAt <= now) failedAdminAttempts.delete(address);
  }
  const attempts = failedAdminAttempts.get(clientAddress);
  if (!attempts) return null;
  if (attempts.lockedUntil) {
    if (attempts.lockedUntil > now) {
      return { retryAfterSeconds: Math.ceil((attempts.lockedUntil - now) / 1000) };
    }
  }
  return null;
}

function recordAdminPasswordFailure(clientAddress, now = Date.now()) {
  let attempts = failedAdminAttempts.get(clientAddress);
  if (!attempts || now - attempts.windowStartedAt >= ADMIN_ATTEMPT_WINDOW_MS) {
    attempts = { attempts: 0, windowStartedAt: now };
  }
  attempts.attempts += 1;
  if (attempts.attempts >= ADMIN_MAX_FAILED_ATTEMPTS) {
    attempts.lockedUntil = now + ADMIN_LOCKOUT_MS;
  }
  failedAdminAttempts.set(clientAddress, attempts);
  return {
    attempts: attempts.attempts,
    lockout: attempts.lockedUntil
      ? { retryAfterSeconds: Math.ceil((attempts.lockedUntil - now) / 1000) }
      : null,
  };
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
