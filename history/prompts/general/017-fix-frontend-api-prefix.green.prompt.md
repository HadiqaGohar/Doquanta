---
ID: 017
TITLE: Fix frontend to match backend /api prefix
STAGE: green
DATE_ISO: 2026-01-06
SURFACE: agent
MODEL: gemini-2.0-flash-exp
FEATURE: routing
BRANCH: main
USER: hadiqa
COMMAND: fix chatbot 404 mismatch
LABELS: ["routing", "api-prefix", "404", "session-registration"]
LINKS:
  SPEC: null
  TICKET: null
  ADR: null
  PR: null
FILES_YAML:
  - todo-frontend/src/utils/auth.ts
---

# PROMPT_TEXT
Chatbot still reports "Not Found" because of a mismatch between frontend request paths and backend route definitions after moving to `/api` prefix.

# RESPONSE_TEXT
I identified that while the backend routes were moved to the `/api` prefix, the frontend's `ensureSessionRegistered` function was still calling the old root path. I updated `todo-frontend/src/utils/auth.ts` to include the `/api` prefix in its backend URL construction.

# OUTCOME
Frontend and backend paths are now perfectly aligned. After the final redeployment, the chatbot will be functional.
