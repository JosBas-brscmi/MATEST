import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { once } from 'node:events';
import Database from 'better-sqlite3';
import { openDatabase } from '../api/database.js';

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

const previousDbPath = process.env.DB_PATH;
const quizMigrationPath = join(temporaryDirectory, 'quiz-migration.sqlite');
const preDeleteMigrationDb = new Database(quizMigrationPath);
preDeleteMigrationDb.exec(`
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
  CREATE TABLE custom_quizzes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    questions_json TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE TABLE assessment_results (
    id TEXT PRIMARY KEY,
    candidate_id TEXT NOT NULL REFERENCES candidates(id) ON DELETE RESTRICT,
    custom_quiz_id TEXT REFERENCES custom_quizzes(id) ON DELETE RESTRICT,
    test_key TEXT NOT NULL UNIQUE,
    test_type TEXT NOT NULL CHECK (test_type IN ('iq', 'english', 'aptitude', 'custom')),
    submitted_at TEXT NOT NULL,
    score_percent INTEGER NOT NULL,
    score_correct INTEGER NOT NULL,
    score_total INTEGER NOT NULL,
    auto_submitted INTEGER NOT NULL DEFAULT 0,
    answers_json TEXT NOT NULL,
    aptitude_report_json TEXT,
    payload_json TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  INSERT INTO candidates VALUES ('migration-candidate', 'migration@example.test', 'Migration', '', '', '', 'now', 'now');
  INSERT INTO custom_quizzes VALUES ('migration-quiz', 'Migration Quiz', 30, '[]', 'now');
  INSERT INTO assessment_results VALUES (
    'migration-result', 'migration-candidate', 'migration-quiz', 'MIGRATION-RESULT', 'custom',
    'now', 100, 1, 1, 0, '{}', NULL,
    '{"testTitle":"Migration Quiz"}', 'now'
  );
`);
preDeleteMigrationDb.close();
process.env.DB_PATH = quizMigrationPath;
const { db: quizMigrationDb } = openDatabase();
try {
  const migratedResult = quizMigrationDb.prepare('SELECT custom_quiz_id, payload_json FROM assessment_results WHERE id = ?')
    .get('migration-result');
  assert.equal(migratedResult.custom_quiz_id, 'migration-quiz');
  assert.equal(JSON.parse(migratedResult.payload_json).testTitle, 'Migration Quiz');
  const migratedForeignKey = quizMigrationDb.pragma('foreign_key_list(assessment_results)')
    .find((foreignKey) => foreignKey.table === 'custom_quizzes' && foreignKey.from === 'custom_quiz_id');
  assert.equal(migratedForeignKey.on_delete, 'SET NULL');
  quizMigrationDb.prepare('DELETE FROM custom_quizzes WHERE id = ?').run('migration-quiz');
  assert.equal(
    quizMigrationDb.prepare('SELECT custom_quiz_id FROM assessment_results WHERE id = ?').get('migration-result').custom_quiz_id,
    null,
  );
} finally {
  quizMigrationDb.close();
  if (previousDbPath === undefined) delete process.env.DB_PATH;
  else process.env.DB_PATH = previousDbPath;
}

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
  const activeAssessmentsResponse = await fetch(`${baseUrl}/api/assessments`);
  assert.equal(activeAssessmentsResponse.status, 200);
  assert.deepEqual((await activeAssessmentsResponse.json()).assessments.map((assessment) => assessment.key), [
    'iq', 'english', 'aptitude',
  ]);

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
    answers: { p01: 2, p02: 1 },
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
    answers: { wa01: 1, wa02: 0 },
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
      {
        id: 'custom-q3',
        type: 'grammar',
        categoryLabel: 'Grammar',
        prompt: 'Choose the correct word.',
        choices: ['First', 'Second', 'Third', 'Fourth'],
        answerIndex: 2,
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
  const unauthorizedQuizList = await fetch(`${baseUrl}/api/admin/quizzes`);
  assert.equal(unauthorizedQuizList.status, 401);
  const authorizedQuizList = await fetch(`${baseUrl}/api/admin/quizzes`, {
    headers: { 'X-Admin-Password': adminPassword },
  });
  assert.equal(authorizedQuizList.status, 200);
  const adminQuizList = (await authorizedQuizList.json()).quizzes;
  assert.deepEqual(adminQuizList.slice(0, 3).map(({ id, kind, isActive }) => ({ id, kind, isActive })), [
    { id: 'builtin-iq', kind: 'builtin', isActive: true },
    { id: 'builtin-english', kind: 'builtin', isActive: true },
    { id: 'builtin-aptitude', kind: 'builtin', isActive: true },
  ]);
  assert.deepEqual(adminQuizList[3], {
    id: customQuizId,
    title: customQuiz.title,
    durationMinutes: customQuiz.durationMinutes,
    questionCount: 3,
    kind: 'custom',
    isActive: true,
  });

  const hideBuiltinResponse = await fetch(`${baseUrl}/api/admin/assessments/iq`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'X-Admin-Password': adminPassword },
    body: JSON.stringify({ isActive: false }),
  });
  assert.equal(hideBuiltinResponse.status, 200);
  assert.deepEqual((await (await fetch(`${baseUrl}/api/assessments`)).json()).assessments.map((assessment) => assessment.key), [
    'english', 'aptitude',
  ]);
  const unavailableSubmission = await fetch(`${baseUrl}/api/results`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, testType: 'iq' }),
  });
  assert.equal(unavailableSubmission.status, 400);
  const restoreBuiltinResponse = await fetch(`${baseUrl}/api/admin/assessments/iq`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'X-Admin-Password': adminPassword },
    body: JSON.stringify({ isActive: true }),
  });
  assert.equal(restoreBuiltinResponse.status, 200);

  const adminQuizResponse = await fetch(`${baseUrl}/api/admin/quizzes/${customQuizId}`, {
    headers: { 'X-Admin-Password': adminPassword },
  });
  assert.equal(adminQuizResponse.status, 200);
  assert.deepEqual((await adminQuizResponse.json()).questions, customQuiz.questions);

  const updatedQuiz = { ...customQuiz, title: 'Updated Custom Smoke Quiz', durationMinutes: 45 };
  const updateQuizResponse = await fetch(`${baseUrl}/api/admin/quizzes/${customQuizId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Admin-Password': adminPassword },
    body: JSON.stringify(updatedQuiz),
  });
  assert.equal(updateQuizResponse.status, 200, await updateQuizResponse.text());

  const listedQuizzes = await fetch(`${baseUrl}/api/quizzes`);
  assert.deepEqual((await listedQuizzes.json()).quizzes, [{
    id: customQuizId,
    title: updatedQuiz.title,
    durationMinutes: updatedQuiz.durationMinutes,
    questionCount: 3,
  }]);

  const laterQuizResponse = await fetch(`${baseUrl}/api/admin/quizzes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Admin-Password': adminPassword },
    body: JSON.stringify({ ...customQuiz, title: 'Later Custom Smoke Quiz' }),
  });
  const laterQuiz = await laterQuizResponse.json();
  assert.equal(laterQuizResponse.status, 201, JSON.stringify(laterQuiz));
  const orderingDb = new Database(databasePath);
  try {
    orderingDb.prepare('UPDATE custom_quizzes SET created_at = ? WHERE id = ?')
      .run('2020-01-01T00:00:00.000Z', customQuizId);
    orderingDb.prepare('UPDATE custom_quizzes SET created_at = ? WHERE id = ?')
      .run('2021-01-01T00:00:00.000Z', laterQuiz.id);
  } finally {
    orderingDb.close();
  }
  const orderedQuizzes = await fetch(`${baseUrl}/api/quizzes`);
  assert.deepEqual((await orderedQuizzes.json()).quizzes.map(({ id }) => id), [customQuizId, laterQuiz.id]);
  const deleteLaterQuiz = await fetch(`${baseUrl}/api/admin/quizzes/${laterQuiz.id}`, {
    method: 'DELETE',
    headers: { 'X-Admin-Password': adminPassword },
  });
  assert.equal(deleteLaterQuiz.status, 200, await deleteLaterQuiz.text());

  const fetchedQuiz = await fetch(`${baseUrl}/api/quizzes/${customQuizId}`);
  const fetchedQuizBody = await fetchedQuiz.json();
  assert.deepEqual(fetchedQuizBody.questions, customQuiz.questions.map(({ answerIndex: _answerIndex, ...question }) => question));
  assert.ok(fetchedQuizBody.questions.every((question) => !Object.hasOwn(question, 'answerIndex')));

  const customResultPayload = {
    ...payload,
    testKey: `CUSTOM-${customQuizId}-SMOKE`,
    testType: 'custom',
    customQuizId,
    testTitle: updatedQuiz.title,
    submittedAtISO: new Date(Date.now() + 2000).toISOString(),
    score: { correct: 0, total: 1, percent: 0 },
    answers: { 'custom-q1': 0, 'custom-q2': 4, 'custom-q3': 2 },
  };
  const customSubmission = await fetch(`${baseUrl}/api/results`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customResultPayload),
  });
  const customSubmissionBody = await customSubmission.json();
  assert.equal(customSubmission.status, 201, JSON.stringify(customSubmissionBody));
  assert.deepEqual(customSubmissionBody.score, { correct: 2, total: 2, percent: 100 });

  const customQuestionStatsUrl = `${baseUrl}/api/admin/question-stats?testType=custom&quizId=${encodeURIComponent(customQuizId)}`;
  const initialCustomStatsResponse = await fetch(customQuestionStatsUrl, {
    headers: { 'X-Admin-Password': adminPassword },
  });
  assert.equal(initialCustomStatsResponse.status, 200);
  const initialCustomStats = await initialCustomStatsResponse.json();
  assert.equal(initialCustomStats.quizTitle, updatedQuiz.title);
  assert.equal(initialCustomStats.submissionCount, 1);
  assert.equal(initialCustomStats.questions.length, 2);
  assert.equal(initialCustomStats.questions.find((question) => question.id === 'custom-q1').responses, 1);
  assert.equal(initialCustomStats.questions.find((question) => question.id === 'custom-q3').correct, 1);

  const editedQuiz = {
    ...updatedQuiz,
    questions: updatedQuiz.questions.map((question) =>
      question.id === 'custom-q1' ? { ...question, prompt: 'Updated question prompt.' } : question,
    ),
  };
  const editQuizResponse = await fetch(`${baseUrl}/api/admin/quizzes/${customQuizId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Admin-Password': adminPassword },
    body: JSON.stringify(editedQuiz),
  });
  assert.equal(editQuizResponse.status, 200, await editQuizResponse.text());
  const resetCustomStatsResponse = await fetch(customQuestionStatsUrl, {
    headers: { 'X-Admin-Password': adminPassword },
  });
  assert.equal(resetCustomStatsResponse.status, 200);
  const resetCustomStats = await resetCustomStatsResponse.json();
  assert.equal(resetCustomStats.questions.find((question) => question.id === 'custom-q1').responses, 0);
  assert.equal(resetCustomStats.questions.find((question) => question.id === 'custom-q3').responses, 1);
  assert.equal(resetCustomStats.questions.find((question) => question.id === 'custom-q3').correct, 1);

  const db = new Database(databasePath, { readonly: true, fileMustExist: true });
  try {
    assert.ok(db.prepare('SELECT id FROM assessment_results WHERE id = ?').get('legacy-result'));
    const quizForeignKey = db.pragma('foreign_key_list(assessment_results)')
      .find((foreignKey) => foreignKey.table === 'custom_quizzes' && foreignKey.from === 'custom_quiz_id');
    assert.equal(quizForeignKey.on_delete, 'SET NULL');
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
  const unauthorizedQuestionStats = await fetch(`${baseUrl}/api/admin/question-stats?testType=iq`);
  assert.equal(unauthorizedQuestionStats.status, 401);
  const invalidQuestionStats = await fetch(`${baseUrl}/api/admin/question-stats?testType=custom`, {
    headers: { 'X-Admin-Password': adminPassword },
  });
  assert.equal(invalidQuestionStats.status, 400);
  const iqQuestionStatsResponse = await fetch(`${baseUrl}/api/admin/question-stats?testType=iq`, {
    headers: { 'X-Admin-Password': adminPassword },
  });
  assert.equal(iqQuestionStatsResponse.status, 200);
  const iqQuestionStats = await iqQuestionStatsResponse.json();
  assert.equal(iqQuestionStats.testType, 'iq');
  assert.equal(iqQuestionStats.questions.find((question) => question.id === 'p01').responses, 1);
  assert.equal(iqQuestionStats.questions.find((question) => question.id === 'p01').correct, 1);
  assert.equal(iqQuestionStats.questions.find((question) => question.id === 'p01').accuracyPercent, 100);
  assert.equal(iqQuestionStats.questions.find((question) => question.id === 'p02').incorrect, 1);
  assert.equal(iqQuestionStats.questions.find((question) => question.id === 'p02').accuracyPercent, 0);
  const englishQuestionStatsResponse = await fetch(`${baseUrl}/api/admin/question-stats?testType=english`, {
    headers: { 'X-Admin-Password': adminPassword },
  });
  assert.equal(englishQuestionStatsResponse.status, 200);
  const englishQuestionStats = await englishQuestionStatsResponse.json();
  assert.ok(englishQuestionStats.questions.some((question) => question.id === 'g01' && question.category === 'Grammar'));
  const aptitudeQuestionStatsResponse = await fetch(`${baseUrl}/api/admin/question-stats?testType=aptitude`, {
    headers: { 'X-Admin-Password': adminPassword },
  });
  assert.equal(aptitudeQuestionStatsResponse.status, 200);
  const aptitudeQuestionStats = await aptitudeQuestionStatsResponse.json();
  assert.ok(aptitudeQuestionStats.questions.some((question) => question.id === 'wa01'));
  assert.ok(aptitudeQuestionStats.questions.every((question) => question.id.startsWith('wa')));
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
  assert.ok(resultData.rows.some((row) => row.custom_quiz_title === updatedQuiz.title));

  const deleteQuizResponse = await fetch(`${baseUrl}/api/admin/quizzes/${customQuizId}`, {
    method: 'DELETE',
    headers: { 'X-Admin-Password': adminPassword },
  });
  assert.equal(deleteQuizResponse.status, 200, await deleteQuizResponse.text());
  assert.deepEqual((await (await fetch(`${baseUrl}/api/quizzes`)).json()).quizzes, []);
  assert.equal((await fetch(`${baseUrl}/api/quizzes/${customQuizId}`)).status, 404);
  assert.equal((await fetch(customQuestionStatsUrl, {
    headers: { 'X-Admin-Password': adminPassword },
  })).status, 404);
  const remainingAdminQuizzes = (await (await fetch(`${baseUrl}/api/admin/quizzes`, {
    headers: { 'X-Admin-Password': adminPassword },
  })).json()).quizzes;
  assert.deepEqual(remainingAdminQuizzes.map((quiz) => quiz.id), [
    'builtin-iq', 'builtin-english', 'builtin-aptitude',
  ]);

  const resultsAfterQuizRemoval = await fetch(`${baseUrl}/api/admin/results`, {
    headers: { 'X-Admin-Password': adminPassword },
  });
  const preservedResults = await resultsAfterQuizRemoval.json();
  const preservedQuizResult = preservedResults.rows.find((row) => row.test_key === customResultPayload.testKey);
  assert.equal(preservedQuizResult.custom_quiz_title, updatedQuiz.title);
  const resultsDb = new Database(databasePath, { readonly: true, fileMustExist: true });
  try {
    const preservedQuizRecord = resultsDb.prepare('SELECT custom_quiz_id FROM assessment_results WHERE test_key = ?')
      .get(customResultPayload.testKey);
    assert.equal(preservedQuizRecord.custom_quiz_id, null);
    assert.equal(resultsDb.prepare('SELECT quiz_id FROM custom_quiz_question_stats WHERE quiz_id = ?')
      .get(customQuizId), undefined);
    assert.ok(resultsDb.prepare('SELECT id FROM assessment_results WHERE test_key = ?')
      .get(customResultPayload.testKey));
  } finally {
    resultsDb.close();
  }

  const unauthorizedResultDelete = await fetch(`${baseUrl}/api/admin/results/legacy-result`, {
    method: 'DELETE',
  });
  assert.equal(unauthorizedResultDelete.status, 401);
  const missingResultDelete = await fetch(`${baseUrl}/api/admin/results/missing-result`, {
    method: 'DELETE',
    headers: { 'X-Admin-Password': adminPassword },
  });
  assert.equal(missingResultDelete.status, 404);
  const deleteLegacyResult = await fetch(`${baseUrl}/api/admin/results/legacy-result`, {
    method: 'DELETE',
    headers: { 'X-Admin-Password': adminPassword },
  });
  assert.equal(deleteLegacyResult.status, 200);
  const afterLegacyDeleteDb = new Database(databasePath, { readonly: true, fileMustExist: true });
  try {
    assert.equal(afterLegacyDeleteDb.prepare('SELECT id FROM assessment_results WHERE id = ?').get('legacy-result'), undefined);
    assert.equal(afterLegacyDeleteDb.prepare('SELECT id FROM candidates WHERE id = ?').get('legacy-candidate'), undefined);
  } finally {
    afterLegacyDeleteDb.close();
  }

  const smokeResultIds = resultData.rows
    .filter((row) => row.candidate_email === 'smoke@example.test')
    .map((row) => row.id);
  const invalidBulkDelete = await fetch(`${baseUrl}/api/admin/results`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', 'X-Admin-Password': adminPassword },
    body: JSON.stringify({ resultIds: [] }),
  });
  assert.equal(invalidBulkDelete.status, 400);
  const unauthorizedBulkDelete = await fetch(`${baseUrl}/api/admin/results`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resultIds: smokeResultIds.slice(0, 2) }),
  });
  assert.equal(unauthorizedBulkDelete.status, 401);
  const bulkDeleteResponse = await fetch(`${baseUrl}/api/admin/results`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', 'X-Admin-Password': adminPassword },
    body: JSON.stringify({ resultIds: smokeResultIds.slice(0, 2) }),
  });
  assert.equal(bulkDeleteResponse.status, 200);
  assert.deepEqual(await bulkDeleteResponse.json(), { ok: true, deletedCount: 2 });
  const afterBulkDeleteDb = new Database(databasePath, { readonly: true, fileMustExist: true });
  try {
    const remainingCandidate = afterBulkDeleteDb.prepare('SELECT id FROM candidates WHERE email = ?')
      .get('smoke@example.test');
    assert.ok(remainingCandidate);
    for (const resultId of smokeResultIds.slice(0, 2)) {
      assert.equal(afterBulkDeleteDb.prepare('SELECT id FROM assessment_results WHERE id = ?').get(resultId), undefined);
    }
  } finally {
    afterBulkDeleteDb.close();
  }

  for (const resultId of smokeResultIds.slice(2)) {
    const deleteResponse = await fetch(`${baseUrl}/api/admin/results/${encodeURIComponent(resultId)}`, {
      method: 'DELETE',
      headers: { 'X-Admin-Password': adminPassword },
    });
    assert.equal(deleteResponse.status, 200, await deleteResponse.text());
    const afterSingleDeleteDb = new Database(databasePath, { readonly: true, fileMustExist: true });
    try {
      const candidate = afterSingleDeleteDb.prepare('SELECT id FROM candidates WHERE email = ?')
        .get('smoke@example.test');
      assert.equal(Boolean(candidate), false);
    } finally {
      afterSingleDeleteDb.close();
    }
  }

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
