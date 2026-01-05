---
id: "001-fix-chat-api-authentication"
title: "Fix Chat API Authentication Issue"
stage: "green"
date: "2026-01-06"
surface: "agent"
model: "gemini-2.5-flash"
feature: "chat-authentication"
branch: "main"
user: "hadiqa"
command: "fix-auth-issue"
labels:
  - "bugfix"
  - "authentication"
  - "nextjs"
  - "fastapi"
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml: |
  - todo-frontend/src/app/api/chat/ask-ai/route.ts
  - todo-frontend/src/app/api/chat/route.ts
  - todo-frontend/src/app/api/chat/voice/route.ts
  - todo-frontend/src/app/api/chat/file/route.ts
tests_yaml: |
  - Manual verification by matching code pattern with working /api/tasks route
prompt_text: |
  Investigate why the /chat/ask-ai endpoint returns 401 Unauthorized while other endpoints work.
  1. Find the definition of the /chat/ask-ai endpoint in the backend.
  2. Check what authentication dependency is used for this endpoint.
  3. Compare it with the authentication used for /api/{user_id}/tasks/ which is working.
  4. Look for any middleware that might be interfering.
  
  [Followed by instructions to fix the issue in all chat-related endpoints]
response_text: |
  Identified that the backend requires `Authorization: Bearer <token>` (via `HTTPBearer`), but the Next.js API routes for chat were only forwarding cookies. The tasks API route was working because it explicitly extracted the token from cookies and added the Authorization header.
  
  Fixed the issue by updating `ask-ai`, `chat`, `chat/voice`, and `chat/file` routes in the frontend to:
  1. Import and call `ensureSessionRegistered` to sync the session with the backend.
  2. Extract the session token from Better Auth cookies using regex.
  3. Include the `Authorization: Bearer <token>` header in the fetch request to the backend.
outcome: "success"
evaluation: "Fixed authentication mechanism in frontend proxy routes to match backend requirements."
---
