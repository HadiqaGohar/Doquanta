---
id: "002-fix-dashboard-task-count"
title: "Fix Dashboard Total Tasks Count 0"
stage: "green"
date: "2026-01-06"
surface: "agent"
model: "gemini-2.5-flash"
feature: "dashboard-stats"
branch: "main"
user: "hadiqa"
command: "fix-task-count"
labels:
  - "bugfix"
  - "dashboard"
  - "frontend"
  - "api-types"
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml: |
  - todo-frontend/src/features/tasks/queries.ts
  - todo-frontend/src/features/tasks/hooks.tsx
tests_yaml: |
  - Validated that useTasks hook now correctly consumes the array response from getTasks API.
prompt_text: |
  On dashboard Total Tasks 0
  All tasks created
response_text: |
  Investigated why the dashboard showed 0 tasks despite the backend returning 200 OK with data.
  Found a type mismatch between the frontend query definition and the actual backend response.
  
  The backend `/api/{user_id}/tasks` endpoint returns a direct list of tasks `Task[]`.
  However, `getTasks` in `queries.ts` was typed to return `{tasks: Task[], count: number}` (though it returned the raw JSON).
  And `useTasks` in `hooks.tsx` was trying to access `fetchTasks.data?.tasks`, which resulted in `undefined` because `fetchTasks.data` is the array itself.
  
  Fixed by:
  1. Updating `getTasks` return type in `queries.ts` to `Promise<Task[]>`.
  2. Updating `useTasks` in `hooks.tsx` to assign `const allTasks = fetchTasks.data || [];` instead of accessing `.tasks`.
  
  This should correctly populate the task list and stats on the dashboard.
outcome: "success"
evaluation: "Fixed data consumption logic in frontend hooks to match backend API response structure."
---
