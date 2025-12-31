---
id: 008
title: Fix edit task not saving
stage: green
date: 2025-12-30
surface: agent
model: gemini-2.0-flash-exp
feature: phase-2
branch: main
user: Hadiqa
command: fix-bug
labels: [bugfix, backend, database]
links: null
files_yaml:
  - todo-backend/src/models/models.py
  - todo-backend/migrate_db.py
tests_yaml: []
---

## Prompt
edit task save nhi ho rha

## Response
I investigated why editing tasks wasn't saving. The issue was a mismatch between the frontend data (which included `priority`, `category`, `due_date`, and recurrence fields) and the backend database schema.

1.  **Missing Database Columns**: The `task` table in the database was missing the `priority`, `category`, `due_date`, `reminder_time`, and recurrence columns.
2.  **Incomplete Model**: The backend `Task` model in `todo-backend/src/models/models.py` was also missing the date and recurrence fields.

I fixed this by:
1.  Updating the `Task` model in `todo-backend/src/models/models.py` to include all missing fields.
2.  Creating and running a temporary migration script `todo-backend/migrate_db.py` to add the missing columns to the PostgreSQL database.

Now the backend can correctly accept and store all the fields sent by the frontend edit dialog.
