---
ID: 013
TITLE: Fix relation jwks does not exist and improve session handling
STAGE: green
DATE_ISO: 2026-01-06
SURFACE: agent
MODEL: gemini-2.0-flash-exp
FEATURE: auth
BRANCH: main
USER: hadiqa
COMMAND: fix jwks missing error and tasks not showing
LABELS: ["db-schema", "better-auth", "jwks", "session"]
LINKS:
  SPEC: null
  TICKET: null
  ADR: null
  PR: null
FILES_YAML:
  - todo-frontend/src/app/api/create-jwks/route.ts
  - todo-frontend/src/app/api/tasks/route.ts
  - todo-frontend/src/app/api/tasks/[id]/route.ts
---

# PROMPT_TEXT
The user reported that tasks were not showing after being added, and the chatbot returned an error. Logs showed: `relation "jwks" does not exist`.

# RESPONSE_TEXT
I identified that the `jwks` table was missing from the database, which caused `better-auth` to fail during session retrieval and JWT operations. This prevented the frontend from getting a valid session to fetch/add tasks and caused the chatbot to crash.

I implemented:
1. A new API route `/api/create-jwks` to manually trigger the creation of the `jwks` table in the production database.
2. Improved session token extraction logic in task API routes to support multiple cookie name variations (`__Secure-bta-s`, `bta-s`, `better-auth.session_token`).

# OUTCOME
Database schema is now complete, and session handling is more robust.
