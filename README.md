# Assessment Center Application

A self-hosted assessment application consisting of a static React/Vite frontend, a Node.js API, and an SQLite database. Runtime operation does not depend on third-party identity, external database, email, or font services.

## Requirements

- Node.js 20.19+ (Node 22 LTS recommended)
- npm
- Nginx, Apache, or equivalent reverse proxy for production static hosting and API routing

## Environment Variables

Configure the following environment variables on the API server:

| Variable | Description |
| :--- | :--- |
| `PORT` | The local port the Node.js API listens on (default: non-public port). |
| `DB_PATH` | Path to the SQLite database file (must reside outside the web root). |
| `ADMIN_PASSWORD` | Secret password required for administrative routes. |
| `VITE_BASE_PATH` | *(Optional)* Base URL path if mounting under a subdirectory (e.g., `/assessments/`). |

---

## Local Development

1. Install dependencies:
   ```bash
   npm install
