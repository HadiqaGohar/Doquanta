---
id: 007
title: Add task categories and priorities
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
  - todo-backend/src/models/models.py
  - todo-backend/src/api/tasks.py
  - todo-frontend/src/app/components/AddTodo.tsx
tests_yaml: []
---

## Prompt
add task category work, personal, health, finannce learining other

## Response
I implemented task categories and priorities across the stack:
1.  **Backend Model**: Added `category` and `priority` fields to the `Task` model in `todo-backend/src/models/models.py`.
2.  **Backend API**: Updated `list_tasks` in `todo-backend/src/api/tasks.py` to support filtering by category and priority.
3.  **Frontend UI**: Updated `AddTodo.tsx` to include dropdowns for selecting Category (Work, Personal, Health, Finance, Learning, Other) and Priority (Low, Medium, High) when creating a task.
