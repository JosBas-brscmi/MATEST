# BROWAVE MATTA CENTER

A self-hosted assessment application made of a static React/Vite frontend, a separate Node.js API, and a local SQLite database. Runtime operation does not require a hosted identity, database, functions, email, or font service.

## Requirements

- Node.js 20.19+ (Node 22 LTS recommended)
- npm
- nginx or Apache for production static hosting and API reverse proxy

## Local development

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and replace `ADMIN_TOKEN` with a long random secret. For example, generate one with Node: `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`.
3. Run `npm run dev`. Vite serves the frontend and proxies `/api` to the local Node API. The API creates `data/matta.sqlite` on first start.
4. Open `/admin` and use the configured token to view saved results.

The production frontend is built with `npm run build` and emitted to `dist/`. Start the standalone API with `npm run start:api`. Set `DB_PATH` to a durable path outside the static document root in production. `ADMIN_TOKEN` must be configured; without it, admin access fails closed.

## Production deployment

1. Build the frontend and copy the contents of `dist/` to the nginx/Apache document root.
2. Install the Node dependencies on the API host and run `npm run start:api` under a process manager (systemd, NSSM, PM2, or equivalent). Configure `PORT`, `DB_PATH`, and `ADMIN_TOKEN` in the service environment.
3. Ensure the API service account can write to the database directory. Keep the SQLite database, `.env`, and backups outside the public web root. Back up the database regularly; with SQLite WAL mode enabled, stop the service or use SQLite's online backup API/CLI for consistent backups.
4. Configure the web server to proxy `/api/` to `127.0.0.1:3001` before applying the single-page-app fallback. Example configurations are in [deploy/nginx.conf](deploy/nginx.conf) and [deploy/apache-vhost.conf](deploy/apache-vhost.conf). Update the document root and server name for your host and use HTTPS at the web-server layer for deployments handling personal data.

The API listens only on `127.0.0.1` by default and should not be exposed directly to the public internet. The sample web-server configurations serve the SPA fallback while forwarding API requests to Node.

## API

- `GET /api/health` — local API health check.
- `POST /api/results` — validates and saves one assessment submission.
- `GET /api/admin/results?limit=500` — returns up to 1,000 latest rows; requires `Authorization: Bearer <ADMIN_TOKEN>`.

Admin credentials are held in browser `sessionStorage` only for that tab/session. Use a unique secret and restrict access to the admin page at the network/web-server layer if stronger access controls are needed. This shared-token setup is intentionally simple; it is not an individual user-account system.

## Local database

The schema is in [database/schema.sql](database/schema.sql). It separates candidate records from assessment results, enforces a unique candidate email and test key, stores scores and submission metadata in queryable columns, and preserves answers and the submitted payload as JSON text. The database is created automatically at the configured `DB_PATH`.

To move existing records, export the old results table as JSON (an array of rows, including the prior `payload_json` and score columns), then run `node scripts/import-legacy-results.js <exported-results.json>` with `DB_PATH` pointing at the destination database. The importer validates rows and skips test keys already imported. Review a backup and verify record counts before retiring the old database. No remote account was accessed as part of this code migration.

## Important assessment limitations

- Assessment answers, question banks, and scoring still run in the browser. The API validates payload shape and score consistency but cannot prove that a submitted score or identity is genuine. For high-stakes use, move question selection and scoring server-side and add per-candidate authentication/attempt controls.
- The final-report email feature was removed rather than retaining an external mail dependency. Results remain available in the local admin dashboard and database.
- The local SQLite database contains personal and assessment data. Set restrictive filesystem permissions, limit admin/network access, define a retention policy, and protect backups.

## Content and customization

- The project includes an original demo question bank for functional testing. Do not copy third-party proprietary test items without explicit written permission or a license.
- Update assessment content in `src/data/` and timings/item counts in `src/lib.ts`.
- The landing page uses system fonts and bundled/local assets so it does not request Google Fonts at runtime.
