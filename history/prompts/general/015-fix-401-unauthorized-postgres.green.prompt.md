---
ID: 015
TITLE: Fix 401 Unauthorized by correcting Postgres schema handling
STAGE: green
DATE_ISO: 2026-01-06
SURFACE: agent
MODEL: gemini-2.0-flash-exp
FEATURE: auth
BRANCH: main
USER: hadiqa
COMMAND: fix 401 Unauthorized fetch tasks
LABELS: ["postgres", "case-sensitivity", "better-auth", "401-unauthorized"]
LINKS:
  SPEC: null
  TICKET: null
  ADR: null
  PR: null
FILES_YAML:
  - todo-backend/src/core/security.py
  - todo-backend/main.py
---

# PROMPT_TEXT
The user reported "Failed to fetch tasks: 401" despite name and email showing correctly on the dashboard.

# RESPONSE_TEXT
I diagnosed that the backend was failing to verify the session token against the production PostgreSQL database because:
1. PostgreSQL is case-sensitive for unquoted identifiers, and Better Auth uses camelCase columns (`"userId"`, `"expiresAt"`). The backend query was looking for lowercase versions.
2. The session registration endpoint was using SQLite-specific `INSERT OR REPLACE` syntax which failed on Postgres.

I implemented:
1. Quoted camelCase column identifiers in `verify_session_token` to correctly target Postgres columns.
2. `INSERT ... ON CONFLICT` syntax in `main.py` for Postgres-compatible session registration.
3. Fallback logic to support both SQLite (local) and Postgres (production).

# OUTCOME
Backend can now correctly verify sessions in the production database. Tasks should fetch successfully after backend redeployment.
