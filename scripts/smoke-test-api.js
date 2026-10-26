import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { once } from 'node:events';
import Database from 'better-sqlite3';

const port = 31000 + Math.floor(Math.random() * 20000);
const adminPassword = 'smoke-test-local-admin-password';
const temporaryDirectory = await mkdtemp(join(tmpdir(), 'matta-api-test-'));
const databasePath = join(temporaryDirectory, 'test.sqlite');
const legacyDatabase = new Database(databasePath);
legacyDatabase.exec(`
  CREATE TABLE candidates (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL COLLATE NOCASE UNIQUE,
    full_name TEXT NOT NULL,
    school TEXT NOT NULL,
    course TEXT NOT NULL,
    phone TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE assessment_results (
    id TEXT PRIMARY KEY,
    candidate_id TEXT NOT NULL REFERENCES candidates(id) ON DELETE RESTRICT,
    test_key TEXT NOT NULL UNIQUE,
    test_type TEXT NOT NULL CHECK (test_type IN ('iq', 'english', 'aptitude')),
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
`);
legacyDatabase.prepare(`
  INSERT INTO candidates (id, email, full_name, school, course, phone, created_at, updated_at)
  VALUES ('legacy-candidate', 'legacy@example.test', 'Legacy Candidate', 'Old School', 'Old Course', '555', ?, ?)
`).run(new Date().toISOString(), new Date().toISOString());
legacyDatabase.prepare(`
  INSERT INTO assessment_results (
    id, candidate_id, test_key, test_type, submitted_at, score_percent,
    score_correct, score_total, auto_submitted, answers_json, aptitude_report_json,
    payload_json, created_at
  ) VALUES ('legacy-result', 'legacy-candidate', 'IQ-LEGACY-001', 'iq', ?, 80, 4, 5, 0, '{}', NULL, '{}', ?)
`).run(new Date().toISOString(), new Date().toISOString());
legacyDatabase.close();
const child = spawn(process.execPath, ['api/server.js'], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    PORT: String(port),
    DB_PATH: databasePath,
    ADMIN_PASSWORD: adminPassword,
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let logs = '';
child.stdout.setEncoding('utf8').on('data', (chunk) => { logs += chunk; });
child.stderr.setEncoding('utf8').on('data', (chunk) => { logs += chunk; });

try {
  const started = await Promise.race([
    once(child.stdout, 'data'),
    once(child, 'exit').then(([code]) => { throw new Error(`API exited (${code}): ${logs}`); }),
    new Promise((_, reject) => setTimeout(() => reject(new Error(`API startup timeout: ${logs}`)), 10000)),
  ]);
  assert.ok(String(started[0]).includes('MATTA API listening'), logs);

  const baseUrl = `http://127.0.0.1:${port}`;
  const health = await fetch(`${baseUrl}/api/health`);
  assert.equal(health.status, 200);
  assert.deepEqual(await health.json(), { ok: true });

  const invalid = await fetch(`${baseUrl}/api/results`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}),
  });
  assert.equal(invalid.status, 400);

  const payload = {
    testKey: 'IQ-SMOKE-TEST-001',
    testType: 'iq',
    candidateEmail: 'SMOKE@example.test',
    candidateName: 'Smoke Test',
    candidateSchool: 'Local School',
    candidateCourse: 'Assessment',
    candidatePhone: '123456789',
    submittedAtISO: new Date().toISOString(),
    score: { correct: 4, total: 5, percent: 80 },
    answers: { q1: 1, q2: 2 },
    autoSubmitted: false,
  };
  const submission = await fetch(`${baseUrl}/api/results`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
  });
  assert.equal(submission.status, 201, await submission.text());

  const aptitudePayload = {
    ...payload,
    testKey: 'APT-SMOKE-TEST-001',
    testType: 'aptitude',
    submittedAtISO: new Date(Date.now() + 1000).toISOString(),
    score: { correct: 12, total: 15, percent: 80 },
    answers: Object.fromEntries(Array.from({ length: 15 }, (_, index) => [`p${String(index + 1).padStart(2, '0')}`, 2])),
    autoSubmitted: true,
  };
  const aptitudeSubmission = await fetch(`${baseUrl}/api/results`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(aptitudePayload),
  });
  assert.equal(aptitudeSubmission.status, 201, await aptitudeSubmission.text());

  const customQuiz = {
    title: 'Custom Smoke Quiz',
    durationMinutes: 30,
    questions: [
      {
        id: 'custom-q1',
        type: 'grammar',
        categoryLabel: 'Grammar',
        title: 'Sentence',
        prompt: 'Choose the correct form.',
        passage: '',
        passageTitle: 'Passage',
        containerColor: '#112233',
        choices: ['Correct', 'Incorrect', 'Maybe', 'Unknown'],
        answerIndex: 0,
      },
      {
        id: 'custom-q2',
        type: 'likert',
        categoryLabel: 'Likert Scale',
        prompt: 'I enjoy learning.',
        choices: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
        answerIndex: -1,
      },
    ],
  };
  const createQuiz = await fetch(`${baseUrl}/api/admin/quizzes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Admin-Password': adminPassword },
    body: JSON.stringify(customQuiz),
  });
  const createQuizResponse = await createQuiz.json();
  assert.equal(createQuiz.status, 201, JSON.stringify(createQuizResponse));
  const { id: customQuizId } = createQuizResponse;
  const listedQuizzes = await fetch(`${baseUrl}/api/quizzes`);
  assert.deepEqual((await listedQuizzes.json()).quizzes, [{
    id: customQuizId,
    title: customQuiz.title,
    durationMinutes: customQuiz.durationMinutes,
    questionCount: 2,
  }]);
  const fetchedQuiz = await fetch(`${baseUrl}/api/quizzes/${customQuizId}`);
  const fetchedQuizBody = await fetchedQuiz.json();
  assert.deepEqual(fetchedQuizBody.questions, customQuiz.questions.map(({ answerIndex: _answerIndex, ...question }) => question));
  assert.ok(fetchedQuizBody.questions.every((question) => !Object.hasOwn(question, 'answerIndex')));

  const customResultPayload = {
    ...payload,
    testKey: `CUSTOM-${customQuizId}-SMOKE`,
    testType: 'custom',
    customQuizId,
    testTitle: customQuiz.title,
    submittedAtISO: new Date(Date.now() + 2000).toISOString(),
    score: { correct: 0, total: 1, percent: 0 },
    answers: { 'custom-q1': 0, 'custom-q2': 4 },
  };
  const customSubmission = await fetch(`${baseUrl}/api/results`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customResultPayload),
  });
  const customSubmissionBody = await customSubmission.json();
  assert.equal(customSubmission.status, 201, JSON.stringify(customSubmissionBody));
  assert.deepEqual(customSubmissionBody.score, { correct: 1, total: 1, percent: 100 });

  const db = new Database(databasePath, { readonly: true, fileMustExist: true });
  try {
    assert.ok(db.prepare('SELECT id FROM assessment_results WHERE id = ?').get('legacy-result'));
    const storedCustomResult = db.prepare('SELECT custom_quiz_id, test_type FROM assessment_results WHERE test_key = ?').get(customResultPayload.testKey);
    assert.equal(storedCustomResult.custom_quiz_id, customQuizId);
    assert.equal(storedCustomResult.test_type, 'custom');
    assert.equal(db.prepare('SELECT score_percent FROM assessment_results WHERE test_key = ?').get(customResultPayload.testKey).score_percent, 100);
    const candidate = db.prepare('SELECT * FROM candidates WHERE email = ?').get('smoke@example.test');
    assert.ok(candidate.id);
    assert.equal(candidate.full_name, payload.candidateName);
    assert.equal(candidate.school, payload.candidateSchool);
    assert.equal(candidate.course, payload.candidateCourse);
    assert.equal(candidate.phone, payload.candidatePhone);
    assert.ok(candidate.created_at);
    assert.ok(candidate.updated_at);

    const readResult = db.prepare('SELECT * FROM assessment_results WHERE test_key = ?').get(payload.testKey);
    assert.ok(readResult.id);
    assert.equal(readResult.candidate_id, candidate.id);
    assert.equal(readResult.test_type, payload.testType);
    assert.equal(readResult.submitted_at, payload.submittedAtISO);
    assert.equal(readResult.score_percent, payload.score.percent);
    assert.equal(readResult.score_correct, payload.score.correct);
    assert.equal(readResult.score_total, payload.score.total);
    assert.equal(readResult.auto_submitted, 0);
    assert.equal(readResult.answers_json, JSON.stringify(payload.answers));
    assert.equal(readResult.aptitude_report_json, null);
    assert.deepEqual(JSON.parse(readResult.payload_json), payload);
    assert.ok(readResult.created_at);

    const aptitudeResult = db.prepare('SELECT * FROM assessment_results WHERE test_key = ?').get(aptitudePayload.testKey);
    assert.ok(aptitudeResult.aptitude_report_json);
    assert.deepEqual(JSON.parse(aptitudeResult.aptitude_report_json).personality, {
      conscientiousness: 50,
      extraversion: 50,
      agreeableness: 50,
      emotional_stability: 50,
      openness: 50,
    });
    assert.deepEqual(JSON.parse(aptitudeResult.answers_json), aptitudePayload.answers);
  } finally {
    db.close();
  }

  const duplicate = await fetch(`${baseUrl}/api/results`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
  });
  assert.equal(duplicate.status, 409);

  const unauthorized = await fetch(`${baseUrl}/api/admin/results`);
  assert.equal(unauthorized.status, 401);
  const invalidPassword = await fetch(`${baseUrl}/api/admin/results`, {
    headers: { 'X-Admin-Password': 'incorrect-password' },
  });
  assert.equal(invalidPassword.status, 401);
  const authorized = await fetch(`${baseUrl}/api/admin/results`, {
    headers: { 'X-Admin-Password': adminPassword },
  });
  assert.equal(authorized.status, 200);
  const resultData = await authorized.json();
  assert.equal(resultData.rows.length, 4);
  assert.ok(resultData.rows.filter((row) => row.test_key !== 'IQ-LEGACY-001').every((row) => row.candidate_email === 'smoke@example.test'));
  assert.ok(resultData.rows.some((row) => row.test_type === 'iq'));
  assert.ok(resultData.rows.some((row) => row.test_type === 'aptitude'));
  assert.ok(resultData.rows.some((row) => row.custom_quiz_title === customQuiz.title));

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const failedAttempt = await fetch(`${baseUrl}/api/admin/results`, {
      headers: { 'X-Admin-Password': 'incorrect-password' },
    });
    assert.equal(failedAttempt.status, 401);
  }
  const fourthFailedAttempt = await fetch(`${baseUrl}/api/admin/results`, {
    headers: { 'X-Admin-Password': 'incorrect-password' },
  });
  assert.equal(fourthFailedAttempt.status, 429);
  assert.equal(fourthFailedAttempt.headers.get('retry-after'), '3600');
  const correctPasswordWhileLocked = await fetch(`${baseUrl}/api/admin/results`, {
    headers: { 'X-Admin-Password': adminPassword },
  });
  assert.equal(correctPasswordWhileLocked.status, 429);

  console.log('API smoke test passed: legacy DB migration, quiz authoring/retrieval, custom results, and admin authentication.');
} finally {
  child.kill();
  await Promise.race([once(child, 'exit'), new Promise((resolve) => setTimeout(resolve, 2000))]);
  await rm(temporaryDirectory, { recursive: true, force: true });
}
