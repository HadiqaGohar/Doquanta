---
ID: 016
TITLE: Fix sign-out origin and chatbot API routing
STAGE: green
DATE_ISO: 2026-01-06
SURFACE: agent
MODEL: gemini-2.0-flash-exp
FEATURE: auth-chatbot
BRANCH: main
USER: hadiqa
COMMAND: fix sign-out and chatbot 404
LABELS: ["auth", "trustedOrigins", "routing", "404", "backend"]
LINKS:
  SPEC: null
  TICKET: null
  ADR: null
  PR: null
FILES_YAML:
  - todo-backend/main.py
  - todo-frontend/src/lib/auth/server.ts
  - todo-frontend/src/middleware.ts
---

# PROMPT_TEXT
The user reported "invalid origin" during sign-out and "Not Found" error when using the chatbot to add tasks.

# RESPONSE_TEXT
I resolved the authentication and routing issues:
1. Added `trustedOrigins` to Better Auth configuration in `server.ts` to allow sign-out from the production domain.
2. Moved backend endpoints `/register-session` and `/chat/ask-ai` under the `/api` prefix to match frontend expectations.
3. Updated Next.js middleware to skip API routes, preventing server-side trailing slash redirections that were breaking POST requests.
4. Pushed changes and advised a final backend redeployment.

# OUTCOME
Sign-out is now functional, and chatbot API routing is corrected.
