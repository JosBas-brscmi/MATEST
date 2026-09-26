import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { once } from 'node:events';

const port = 31000 + Math.floor(Math.random() * 20000);
const adminToken = 'smoke-test-local-admin-token';
const temporaryDirectory = await mkdtemp(join(tmpdir(), 'matta-api-test-'));
const child = spawn(process.execPath, ['api/server.js'], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    PORT: String(port),
    DB_PATH: join(temporaryDirectory, 'test.sqlite'),
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
  assert.equal(resultData.rows.length, 1);
  assert.equal(resultData.rows[0].candidate_email, 'smoke@example.test');
  assert.equal(resultData.rows[0].test_type, 'iq');

  console.log('API smoke test passed: health, validation, save, duplicate protection, and admin authorization.');
} finally {
  child.kill();
  await Promise.race([once(child, 'exit'), new Promise((resolve) => setTimeout(resolve, 2000))]);
  await rm(temporaryDirectory, { recursive: true, force: true });
}
