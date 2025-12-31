---
id: 005
title: Add clear completed tasks feature
stage: green
date: 2025-12-30
surface: agent
model: gemini-2.0-flash-exp
feature: phase-2
branch: main
user: Hadiqa
command: add-feature
labels: [feature, backend, frontend]
links: null
files_yaml:
  - todo-backend/src/api/tasks.py
  - todo-frontend/src/features/tasks/queries.ts
  - todo-frontend/src/features/tasks/hooks.tsx
  - todo-frontend/src/components/tasks/task-list.tsx
tests_yaml: []
---

## Prompt
VEry good ab task delete complete task wala feature bhi add kardo

## Response
I implemented the "Delete Completed Tasks" feature across the stack:

1.  **Backend**: Added `delete_completed_tasks` endpoint in `todo-backend/src/api/tasks.py` at `/api/{user_id}/tasks/completed/clear`.
2.  **Frontend Queries**: Added `deleteCompletedTasks` API function in `todo-frontend/src/features/tasks/queries.ts`.
3.  **Frontend Hooks**: Added `deleteCompletedTasks` mutation to `useTasks` hook in `todo-frontend/src/features/tasks/hooks.tsx`.
4.  **Frontend UI**: Added a "Clear all" button in the completed tasks section of `todo-frontend/src/components/tasks/task-list.tsx` with a confirmation dialog.
