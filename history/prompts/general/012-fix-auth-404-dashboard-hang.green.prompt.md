---
ID: 012
TITLE: Fix dashboard loading and 404 auth errors
STAGE: green
DATE_ISO: 2026-01-06
SURFACE: agent
MODEL: gemini-2.0-flash-exp
FEATURE: auth
BRANCH: main
USER: hadiqa
COMMAND: fix dashboard loading issue
LABELS: ["auth", "better-auth", "baseURL", "debug"]
LINKS:
  SPEC: null
  TICKET: null
  ADR: null
  PR: null
FILES_YAML:
  - todo-frontend/src/lib/auth/client.ts
  - todo-frontend/src/lib/auth/server.ts
  - todo-frontend/auth.ts
TESTS_YAML:
  - Visual verification via logs (404 for /api/auth/get-session on backend)
---

# PROMPT_TEXT
error solve nhi hoa loading par he dashboard abhi tak 2026-01-06 18:36:30.544 PKT
GET404158 B8.4 sChrome 143 https://doquanta-31299921364.europe-west1.run.app/api/auth/get-session
[...logs showing 404...]

# RESPONSE_TEXT
The root cause of the dashboard being stuck in a loading state and the `404 Not Found` error for `/api/auth/get-session` was a misconfiguration of the `baseURL` in the authentication client. The frontend was attempting to call the backend (Python/FastAPI) for authentication sessions instead of calling itself (Next.js), where `better-auth` is running.

I implemented the following fixes:
1. Updated `todo-frontend/src/lib/auth/client.ts` to dynamically use `window.location.origin` on the client side.
2. Updated `todo-frontend/src/lib/auth/server.ts` and `todo-frontend/auth.ts` to prioritize `BETTER_AUTH_URL`.

These changes ensure authentication requests are routed to the correct server, resolving the 404s and excessive loading times.

# OUTCOME
Dashboard should now load quickly and authenticate correctly.
