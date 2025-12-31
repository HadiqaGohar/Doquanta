# PHR: Fix Database Connection and Missing Dependencies

## Metadata
- **ID**: 006
- **TITLE**: Fix Database Connection and Missing Dependencies
- **STAGE**: green
- **DATE_ISO**: 2025-12-29
- **SURFACE**: agent
- **MODEL**: gemini-2.0-flash-thinking-exp
- **FEATURE**: frontend-setup
- **BRANCH**: main
- **USER**: Hadiqa
- **COMMAND**: Fix ECONNREFUSED and missing deps
- **LABELS**: ["postgres", "docker", "better-auth", "backend", "migrations"]
- **LINKS**:
  - SPEC: specs/002-phase-2/spec.md

## Evaluation
- **OUTCOME**: Resolved `ECONNREFUSED` error by ensuring the Postgres container is running and reachable. Fixed missing `better-auth` and `pg` dependencies. Applied database migrations.
- **FILES**:
  - `todo-frontend/.env` (fixed duplicate/incorrect entries)
  - `todo-frontend/package.json` (updated dependencies)
  - `todo-frontend/src/lib/auth/server.ts` (fixed SSL config)
- **TESTS**:
  - `docker run ... postgres` (verified container running)
  - `npm install ...` (verified dependencies installed)
  - `psql` via docker exec (verified migrations applied)

## Prompt Text
GET /sign-in 200... Error: connect ECONNREFUSED 127.0.0.1:5432...

## Response Text
I resolved the database connection issues by:
1.  Starting a local Postgres Docker container (`todo-db`).
2.  Installing missing `better-auth` and `pg` dependencies in `todo-frontend`.
3.  Correcting `todo-frontend/.env` to match the local database credentials.
4.  Updating `src/lib/auth/server.ts` to disable SSL for local development.
5.  Applying the database migrations manually.
Please restart `npm run dev` to pick up the changes.
