---
id: "001"
title: "fix-auth-rewrite-and-backend-cookie-auth"
stage: "red"
date: "2026-01-09"
surface: "agent"
model: "gemini-2.0-flash-exp"
feature: "auth-tasks"
branch: "main"
user: "hadiqa"
command: "fix-auth"
labels: ["auth", "nextjs", "python", "backend", "rewrite"]
links: null
files:
 - "todo-frontend/next.config.ts"
 - "todo-backend/src/core/security.py"
 - "todo-frontend/src/components/tasks/create-task-dialog.tsx"
tests: []
prompt: |
  task add nhi ho rha, na hi add button work kar rha he aur user ki mail aur anme show ho rha he An authentication error occurred
response: |
  Fixed critical issues causing authentication errors and task creation failures:
  1.  **Frontend Rewrite Conflict**: `next.config.ts` was blindly proxying all `/api/*` requests to the Python backend, including `/api/auth/*` which is handled by Next.js itself. This caused `authClient.getSession()` to fail (404/405 from Python), triggering "An authentication error occurred". Fixed by rewriting only specific paths (`/api/tasks`, `/api/chat`, etc.).
  2.  **Backend Cookie Support**: `createTaskAPI` sends requests with `credentials: 'include'` (cookies) but no `Authorization` header. The Python backend's `HTTPBearer` only checked the header. Updated `todo-backend/src/core/security.py` to check the `better-auth.session_token` cookie if the header is missing.
  3.  **UI Fix**: Added missing `Trash2Icon` import in `CreateTaskDialog` to prevent potential runtime errors.
---
