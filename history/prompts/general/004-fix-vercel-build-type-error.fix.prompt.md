---
id: 004
title: Fix Vercel build error by adding missing types
stage: fix
date_iso: 2026-01-09
surface: agent
model: gemini-2.0-flash
feature: none
branch: main
user: Hadiqa
command: npm install --save-dev @types/better-sqlite3
labels: ["fix", "typescript", "vercel", "deployment"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml:
  - todo-frontend/package.json
  - todo-frontend/package-lock.json
---

## Prompt
(Vercel build logs showing Type error: Could not find a declaration file for module 'better-sqlite3')

## Response
Types install ho gayi hain. Ab main ye changes commit kar ke push kar raha hoon taake Vercel build pass ho jaye.

## Outcome
Added `@types/better-sqlite3` to devDependencies and pushed to main. Vercel build should now succeed.
