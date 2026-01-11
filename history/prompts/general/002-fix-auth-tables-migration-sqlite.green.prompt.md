---
id: "002"
title: "fix-auth-tables-migration-sqlite"
stage: "green"
date: "2026-01-11"
surface: "agent"
model: "gemini-2.0-flash-exp"
feature: "backend-migration"
branch: "main"
user: "hadiqa"
command: "fix-auth-tables-migration-sqlite"
labels: ["bugfix", "sqlite", "sqlalchemy", "better-auth"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - "todo-backend/create_better_auth_tables.py"
tests:
  - "manual code review"
---

# User Request
(Continuation of previous task) Ensure all backend scripts are compatible with SQLite.

# Response
Identified that `todo-backend/create_better_auth_tables.py` also used `information_schema` queries.
Refactored the script to use `sqlalchemy.inspect` for checking table existence (`inspector.has_table("jwks")`).
This ensures that if the user needs to manually recreate auth tables locally (on SQLite), the script will not fail.

# Outcome
Enhanced robustness of backend utility scripts for local development with SQLite.
