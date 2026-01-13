---
id: 007
title: Make session verification robust for Postgres
stage: fix
date_iso: 2026-01-09
surface: agent
model: gemini-2.0-flash
feature: none
branch: main
user: Hadiqa
command: git push origin main
labels: ["fix", "postgres", "auth", "backend"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml:
  - todo-backend/src/core/security.py
---

## Prompt
(Still getting 401 after signup despite same env variables on both ends)

## Response
Maine `security.py` ko mazeed robust banaya hai taake wo Postgres ke camelCase (`userId`) aur snake_case (`user_id`) dono variations ko handle kare. Kabhi kabhi Better Auth aur SQLAlchemy ke beech naming convention mismatch hota hai.

## Outcome
Enhanced session verification logic to try multiple naming variations and handle Postgres specific quoting. Pushed to main.
