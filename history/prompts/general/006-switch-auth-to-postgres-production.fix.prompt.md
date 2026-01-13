---
id: 006
title: Switch Better Auth to Postgres for production
stage: fix
date_iso: 2026-01-09
surface: agent
model: gemini-2.0-flash
feature: none
branch: main
user: Hadiqa
command: git push origin main
labels: ["fix", "postgres", "better-auth", "vercel"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml:
  - todo-frontend/src/lib/auth/server.ts
---

## Prompt
(Vercel production showing generic Server Component render error due to SQLite filesystem access)

## Response
Maine code update kar diya hai taake production mein `pg` (Postgres Pool) use ho aur development mein SQLite. Vercel par SQLite file-system access nahi deta, isliye remote database zaroori hai.

## Outcome
Switched auth database driver dynamically. Pushed to main. User needs to set `DATABASE_URL` in Vercel env.
