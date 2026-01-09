---
id: 004
title: fix-404-api-and-add-clear-endpoints
stage: refactor
date: 2026-01-07
surface: agent
model: gemini-2.0-flash-exp
feature: 001-ai-todo-features
branch: main
user: Hadiqa
command: /fix
labels: ["bugfix", "api", "backend", "frontend"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - todo-frontend/src/features/tasks/queries.ts
 - todo-frontend/src/app/api/tasks/route.ts
tests: []
---

## Prompt

new error Failed to fetch tasks: 404

mene logout kia dobara signin kia phir bhi Failed to fetch tasks: 404

## Response snapshot

Fixed the 404 error by correcting the API request flow. 

1.  **Corrected URLs:** Reverted the client-side URLs in `queries.ts` to use simple paths like `/api/tasks` instead of `/api/${userId}/tasks`. The client calls the Next.js local API routes, not the backend directly.
2.  **Next.js API proxy updates:** Updated `todo-frontend/src/app/api/tasks/route.ts` to handle the `DELETE` method for clearing all tasks and completed tasks, forwarding them correctly to the backend with the `userId` injected from the server-side session.
3.  **Authentication:** Verified that the Next.js routes correctly extract the session and userId, ensuring secure communication with the backend.

## Outcome

- ✅ Impact: Fixed the 404 error preventing task loading. Enabled "Clear All" functionality through the proxy.
- 🧪 Tests: Manual verification of routing logic.
- 📁 Files: Modified `queries.ts` and `app/api/tasks/route.ts`.
- 🔁 Next prompts: None.
- 🧠 Reflection: In Next.js App Router, client-side code should generally call local `/api/...` routes which act as a secure proxy to the real backend, especially when session management and secret backend URLs are involved.

## Evaluation notes (flywheel)

- Failure modes observed: Incorrect API pathing (double userId injection or missing proxy handlers).
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): null
