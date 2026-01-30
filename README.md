# NgRestaurant

Stage 1: Foundation and Auth. See **[ROADMAP.md](ROADMAP.md)** for the full phased plan (architecture, tech choices, data model, Stages 1–7, security checklist).

## Run with Docker

1. Copy `.env.example` to `.env` and set `JWT_SECRET` (or use the default for dev).
2. Build and start: `docker compose up -d --build`
3. **Port mapping:**
   - **Web (Angular):** http://localhost:8080 (host 8080 → container 80)
   - **API (NestJS):** http://localhost:3000
   - **PostgreSQL:** localhost:5432 (for external tools only)

If http://localhost:3000 is unreachable: (1) **Stop the dev stack first** so port 3000 is free: `docker compose -p ngrestaurant-dev down`. (2) Then start prod: `docker compose up -d --build`. (3) Check that the API container is running: `docker compose ps`. If the api container is exited or restarting, check logs: `docker compose logs api` (e.g. DB connection or env issues).

**After code changes (e.g. Zone.js / front-end fixes):** rebuild the web image so the new bundle is used:

```bash
docker compose build --no-cache web
docker compose up -d
```

Or in one step: `docker compose up -d --build` (rebuilds only changed images).

## Run with Docker (development – live reload)

Use `docker-compose.dev.yml` so **source is mounted** and changes are picked up without rebuilding images. Dev uses a **separate database** (`postgres_data_dev`) so dev and prod data don’t mix.

1. Copy `.env.example` to `.env` if you haven’t.
2. Start dev stack (project name `ngrestaurant-dev` so dev has its own Postgres container and volume):
   ```bash
   npm run docker:dev:up
   ```
   Or: `docker compose -p ngrestaurant-dev -f docker-compose.yml -f docker-compose.dev.yml up -d --build`
3. **API:** `nest start --watch` restarts when you change files in `apps/api`.
4. **Web:** `ng serve` with `--poll 200` rebuilds when you change files in `apps/web`.
5. Open **http://localhost:4200**; `/api` is proxied to the API container.

First run may take a minute while `npm install` runs in both containers. After that, edit code and save – the running containers will reload/rebuild.

To stop: `npm run docker:dev:down` (or the same `docker compose -p ngrestaurant-dev -f ...` command with `down`).

## Run locally (dev)

**API**

1. Start PostgreSQL: `docker compose up -d postgres`
2. Copy `.env.example` to `.env`
3. From repo root: `npm run api:start:dev` (from `apps/api`: `npm run start:dev`)

**Web**

1. From repo root: `npm run web:start` (from `apps/web`: `ng serve`)
2. Open http://localhost:4200
3. Proxy forwards `/api` to the API (port 3000)

## Tests

- **API:** From `apps/api`: `npm run test` (unit), `npm run test:cov` (coverage, 80% threshold), `npm run test:e2e` (e2e; requires DB).
- **Web:** From `apps/web`: `npm run test` (unit), `npm run test:cov` (coverage).

## Flows

- **Register**: Open `/register`, fill name, email, password, restaurant name → creates Restaurant + Admin user → redirects to `/dashboard`
- **Login**: Open `/login`, fill email and password → redirects to `/dashboard`
- **Dashboard**: Sidebar + placeholder; Logout clears session and redirects to `/login`
- Unauthenticated access to `/dashboard` redirects to `/login`
- API routes other than `POST /auth/login` and `POST /auth/register` require a valid JWT (401 otherwise)
