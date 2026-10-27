# BROWAVE MATTA CENTER

A self-hosted assessment application made of a static React/Vite frontend, a separate Node.js API, and a local SQLite database. Runtime operation does not require a hosted identity, database, functions, email, or font service.

## Requirements

- Node.js 20.19+ (Node 22 LTS recommended)
- npm
- nginx or Apache for production static hosting and API reverse proxy

## Local development

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and replace `ADMIN_PASSWORD` with a unique, long random password. For example, generate one with Node: `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"`. Keep this value on the API server; do not put it in frontend code.
3. Run `npm run dev`. Vite serves the frontend and proxies `/api` to the local Node API. The API creates `database/trial.db` on first start.
4. Open `/admin` and use the configured password to view saved results.

The production frontend is built with `npm run build` and emitted to `dist/`. Start the standalone API with `npm run start:api`. Set `DB_PATH` to a durable path outside the static document root in production. `ADMIN_PASSWORD` must be configured in the API environment; without it, admin access fails closed.

## Production deployment

1. Build the frontend and upload the complete contents of `dist/` to the nginx/Apache document root, including `index.html` and every file under `assets/`. For a site mounted under `/MATEST/`, set `VITE_BASE_PATH=/MATEST/` when building and configure the web server to strip `/MATEST` from static paths and map `/MATEST/api/` to the API's `/api/` routes. The sample nginx and Apache configurations support both root and `/MATEST/` deployments. Do not deploy only the HTML file; its hashed asset names change between builds.
2. Install the Node dependencies on the API host and run `npm run start:api` under a process manager (systemd, NSSM, PM2, or equivalent). Configure `PORT`, `DB_PATH`, and `ADMIN_PASSWORD` in the service environment.
3. Ensure the API service account can write to the database directory. Keep the SQLite database, `.env`, and backups outside the public web root. Back up the database regularly; with SQLite WAL mode enabled, stop the service or use SQLite's online backup API/CLI for consistent backups.
4. Configure the web server to proxy `/api/` to `127.0.0.1:3001` before applying the single-page-app fallback. If submissions return 502, verify the API service is running and `http://127.0.0.1:3001/api/health` returns `{"ok":true}` on the web-server host. Example configurations are in [deploy/nginx.conf](deploy/nginx.conf) and [deploy/apache-vhost.conf](deploy/apache-vhost.conf). Update the document root and server name for your host and use HTTPS at the web-server layer for deployments handling personal data.

The API listens only on `127.0.0.1` by default and should not be exposed directly to the public internet. The sample web-server configurations serve the SPA fallback while forwarding API requests to Node.

## API

- `GET /api/health` — local API health check.
- `GET /api/assessments` — lists built-in assessments currently available to candidates.
- `POST /api/results` — validates and saves one assessment submission.
- `GET /api/admin/results?limit=500` — returns up to 1,000 latest rows; requires the configured password in the `X-Admin-Password` header.
- `DELETE /api/admin/results/:resultId` — permanently deletes one assessment result; removes the candidate profile only when no other results remain; requires admin password.
- `DELETE /api/admin/results` with `{ "resultIds": ["..."] }` — permanently deletes up to 1,000 selected results in one transaction; requires admin password.
- `GET /api/quizzes` and `GET /api/quizzes/:quizId` — list published custom quizzes and load a quiz for candidates.
- `GET /api/admin/quizzes` and `GET /api/admin/quizzes/:quizId` — list built-in and custom quizzes and load an editable custom quiz; require admin password.
- `POST /api/admin/quizzes` — creates and immediately publishes a custom quiz; requires admin password.
- `PUT /api/admin/quizzes/:quizId` and `DELETE /api/admin/quizzes/:quizId` — modify or remove a quiz; require admin password.
- `PATCH /api/admin/assessments/:testKey` — hide or restore a built-in assessment; requires admin password.

The admin password is held in browser `sessionStorage` only for that tab/session and is sent to the API over HTTPS. Four incorrect password attempts from the same client address within an hour trigger a one-hour lockout. Lockout counters are kept in API memory and reset when the API process restarts. Use a unique password and restrict access to the admin page at the network/web-server layer if stronger access controls are needed. This shared-password setup is intentionally simple; it is not an individual user-account system.

From the admin dashboard, create, remove, or modify quizzes. Custom quiz removal requires confirmation, unpublishes it from the candidate portal, and preserves historical submissions and their quiz title. Editing changes the quiz candidates see going forward. Built-in IQ, English, and Aptitude assessments also appear in the Remove and Modify lists; they can be hidden from or restored to the candidate portal, but their question banks and scoring remain fixed. Hidden built-in assessments are skipped in the candidate sequence. Custom quiz completion is remembered in the candidate browser, disabling its Start button until Refresh Status is used or a new candidate registers. Custom quizzes support a duration, titled question cards, optional titled passages, per-question container colors, and question type labels. Scored questions use four A–D choices and one correct answer. Likert questions use the existing five-point agreement scale and do not count toward the score. New quizzes appear independently in the candidate portal as soon as they are published.

## Local database

The schema is in [database/schema.sql](database/schema.sql). It separates candidate records from assessment results, enforces a unique candidate email and test key, stores scores and submission metadata in queryable columns, and preserves answers and the submitted payload as JSON text. The database is created automatically at `database/trial.db` by default; relative `DB_PATH` values are resolved from the project root.

To move existing records, export the old results table as JSON (an array of rows, including the prior `payload_json` and score columns), then run `node scripts/import-legacy-results.js <exported-results.json>` with `DB_PATH` pointing at the destination database. The importer validates rows and skips test keys already imported. Review a backup and verify record counts before retiring the old database. No remote account was accessed as part of this code migration.

## Important assessment limitations

- The original fixed-test question banks and scoring still run in the browser. Custom quiz answer keys are withheld from candidates and their scores are calculated by the API, but the API cannot prove a candidate's identity or enforce attempt controls. For high-stakes use, add per-candidate authentication and stronger assessment controls.
- The final-report email feature was removed rather than retaining an external mail dependency. Results remain available in the local admin dashboard and database.
- The local SQLite database contains personal and assessment data. Set restrictive filesystem permissions, limit admin/network access, define a retention policy, and protect backups.

## Content and customization

- The project includes an original demo question bank for functional testing. Do not copy third-party proprietary test items without explicit written permission or a license.
- Update assessment content in `src/data/` and timings/item counts in `src/lib.ts`.
- The landing page uses system fonts and bundled/local assets so it does not request Google Fonts at runtime.
