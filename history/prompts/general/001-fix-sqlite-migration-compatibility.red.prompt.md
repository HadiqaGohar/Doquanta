---
id: "001"
title: "fix-sqlite-migration-compatibility"
stage: "red"
date: "2026-01-11"
surface: "agent"
model: "gemini-2.0-flash-exp"
feature: "backend-migration"
branch: "main"
user: "hadiqa"
command: "fix-sqlite-migration-compatibility"
labels: ["bugfix", "sqlite", "sqlalchemy", "migration"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - "todo-backend/production_migration.py"
  - "todo-backend/migrate_db.py"
tests:
  - "manual verification via python script"
---

# User Request
The user provided logs showing `sqlalchemy.exc.ProgrammingError: (psycopg2.errors.UndefinedColumn) column task.parent_id does not exist` and `WARNING:production_migration:Error checking/adding ... : (sqlite3.OperationalError) no such table: information_schema.columns`. This indicated that the migration script was failing to add columns because it was using PostgreSQL-specific `information_schema` queries against a SQLite database.

# Response
Analyzed the logs and identified the incompatibility in `todo-backend/production_migration.py`.
Modified `todo-backend/production_migration.py` to use `sqlalchemy.inspect` for checking column existence, making it cross-database compatible.
Created a temporary script `todo-backend/run_fix.py` to execute the migration immediately.
Verified that the missing columns (`parent_id`, `attachments`, etc.) were added to `todo.db` using a one-liner Python script.
Also refactored `todo-backend/migrate_db.py` to use `sqlalchemy.inspect` to prevent future issues.
cleaned up the temporary script.

# Outcome
The migration scripts are now compatible with SQLite. The database schema has been updated with the missing columns, resolving the crash on startup.
