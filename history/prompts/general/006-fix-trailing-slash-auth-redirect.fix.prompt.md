---
id: "006"
title: "fix-trailing-slash-auth-redirect"
stage: "fix"
date: "2026-01-11"
surface: "agent"
model: "gemini-2.0-flash-exp"
feature: "frontend-api"
branch: "main"
user: "hadiqa"
command: "fix-production-task-creation"
labels: ["bugfix", "frontend", "api", "redirect", "auth"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - "todo-frontend/src/app/api/tasks/route.ts"
tests:
  - "manual log analysis"
---

# User Request
User reported that creating tasks in production fails (tasks don't show up), but works locally.
Provided logs showing `POST /api/tasks/` -> `307 Temporary Redirect` -> `GET /api/tasks` -> `401 Unauthorized`.

# Response
Analyzed logs and identified that the trailing slash in the frontend API call was triggering a FastAPI redirect.
This redirect caused the loss of Authentication headers (Session Token) in the production environment.
Removed the trailing slash from `todo-frontend/src/app/api/tasks/route.ts`.
Committed and pushed the fix.

# Outcome
The API call should now hit the backend endpoint directly without redirecting, preserving authentication and allowing task creation.
