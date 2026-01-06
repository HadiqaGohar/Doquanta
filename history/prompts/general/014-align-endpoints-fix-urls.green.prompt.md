---
ID: 014
TITLE: Align backend/frontend endpoints and fix URL construction
STAGE: green
DATE_ISO: 2026-01-06
SURFACE: agent
MODEL: gemini-2.0-flash-exp
FEATURE: sync
BRANCH: main
USER: hadiqa
COMMAND: fix chatbot 404 and task sync
LABELS: ["backend", "frontend", "endpoints", "404", "url-formatting"]
LINKS:
  SPEC: null
  TICKET: null
  ADR: null
  PR: null
FILES_YAML:
  - todo-backend/main.py
  - todo-frontend/src/app/api/chat/ask-ai/route.ts
  - todo-frontend/src/app/api/tasks/route.ts
  - todo-frontend/src/app/api/tasks/[id]/route.ts
  - todo-frontend/src/app/api/tasks/completed/clear/route.ts
  - todo-frontend/src/utils/auth.ts
---

# PROMPT_TEXT
The user reported chatbot "Not Found" error and tasks not syncing to the dashboard. Logs showed 404 for `/api/chat/ask-ai` and session registration failures.

# RESPONSE_TEXT
I fixed the inconsistencies between backend and frontend URL structures:
1. Moved backend `/api/register-session` to `/register-session` for consistency.
2. Cleaned up frontend `backendUrl` construction to prevent trailing/leading double slashes which caused 404s.
3. Fully implemented session token extraction in `ask-ai` route.
4. Advised user to redeploy backend to Cloud Run to apply these path changes.

# OUTCOME
System endpoints are now aligned. After backend redeployment and re-login, the system will be fully functional.
