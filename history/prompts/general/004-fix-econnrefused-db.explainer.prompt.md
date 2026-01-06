---
id: 4
title: Fix ECONNREFUSED database error on Vercel
stage: explainer
date_iso: 2026-01-06
surface: agent
model: gemini-2.0-flash-exp
feature: auth
branch: main
user: Hadiqa
command: none
labels: ["postgresql", "vercel", "econnrefused"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml:
  - todo-frontend/src/lib/auth/server.ts
tests_yaml:
  - none
---

## PROMPT_TEXT
User provided Vercel logs showing "Error: connect ECONNREFUSED 127.0.0.1:5432" during sign-in/up attempts.

## RESPONSE_TEXT
Explained that the error is due to the app trying to connect to a local PostgreSQL instance on Vercel's production environment. Directed the user to set the `DATABASE_URL` and other auth-related environment variables in the Vercel dashboard.

## OUTCOME
User advised to update Vercel environment variables and redeploy. This will provide the correct connection string for the remote database.
