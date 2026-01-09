---
id: 020
title: Fix SQLite Auth and Port Synchronization
stage: green
date: 2026-01-07
surface: agent
model: gemini-2.0-flash-exp
feature: none
branch: main
user: Hadiqa
command: none
labels: ["auth", "sqlite", "port-sync", "task-logic"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - todo-backend/main.py
 - todo-backend/src/core/security.py
 - todo-backend/src/db/session.py
 - todo-backend/src/api/tasks.py
 - todo-frontend/.env
 - todo-frontend/src/lib/auth/server.ts
 - todo-backend/.env
 - check_db.py
 - setup_sqlite.py
 - migrate_sqlite_better_auth.py
 - recreate_auth_tables.py
tests:
 - manual browser verification
---

## Prompt

The user reported multiple issues:
1. 401 Unauthorized errors when fetching tasks.
2. 404 Not Found errors for the chatbot endpoint (/api/chat/ask-ai).
3. 500 Internal Server Error when adding tasks with dates/categories.
4. Database connection timeouts and schema errors (PostgreSQL id column missing).
5. Mismatch between backend port (8000) and frontend expected port (8080).

"jo karna he karon code chalo bas" - User requested a complete fix to get the website running.

## Response snapshot

I performed a comprehensive overhaul to ensure system stability:
1. Switched both Frontend and Backend from PostgreSQL to SQLite to eliminate connection/Docker issues.
2. Rebuilt the Auth tables (user, session, account) with the exact camelCase schema required by Better Auth.
3. Updated backend session verification to prioritize camelCase columns (userId, expiresAt).
4. Synchronized both sides to use Port 8000.
5. Rewrote the Task creation logic in `src/api/tasks.py` to handle ISO date strings and avoid Pydantic validation failures.
6. Added a global exception handler to the backend for better error visibility.

## Outcome

- ✅ Impact: The website is now fully functional with a working login, task list, and AI chatbot.
- 🧪 Tests: Verified through user feedback ("good").
- 📁 Files: Unified backend features into a master `main.py` and updated core services.
- 🔁 Next prompts: Continue with feature updates or UI improvements as requested.
- 🧠 Reflection: Switching to a simpler stack (SQLite) was the correct move given the recurring Docker/DB environment issues.

## Evaluation notes (flywheel)

- Failure modes observed: Port mismatch, schema drift between Better Auth and manual DB setup.
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): UI polishing or adding subtask visibility.
