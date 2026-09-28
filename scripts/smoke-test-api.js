import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { once } from 'node:events';
import Database from 'better-sqlite3';

const port = 31000 + Math.floor(Math.random() * 20000);
const adminToken = 'smoke-test-local-admin-token';
const temporaryDirectory = await mkdtemp(join(tmpdir(), 'matta-api-test-'));
const databasePath = join(temporaryDirectory, 'test.sqlite');
const child = spawn(process.execPath, ['api/server.js'], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    PORT: String(port),
    DB_PATH: databasePath,
    ADMIN_TOKEN: adminToken,
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

  const db = new Database(databasePath, { readonly: true, fileMustExist: true });
  try {
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
  const authorized = await fetch(`${baseUrl}/api/admin/results`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.equal(authorized.status, 200);
  const resultData = await authorized.json();
  assert.equal(resultData.rows.length, 2);
  assert.ok(resultData.rows.every((row) => row.candidate_email === 'smoke@example.test'));
  assert.ok(resultData.rows.some((row) => row.test_type === 'iq'));
  assert.ok(resultData.rows.some((row) => row.test_type === 'aptitude'));

  console.log('API smoke test passed: health, validation, save, duplicate protection, and admin authorization.');
} finally {
  child.kill();
  await Promise.race([once(child, 'exit'), new Promise((resolve) => setTimeout(resolve, 2000))]);
  await rm(temporaryDirectory, { recursive: true, force: true });
}
