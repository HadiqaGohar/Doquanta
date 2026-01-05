---
id: 003
title: Add default values for public env vars to fix Vercel build
stage: misc
date_iso: 2026-01-01
surface: agent
model: gemini-2.0-flash-exp
feature: none
branch: 001-ai-todo-chatbot
user: Hadiqa
command: git push origin main
labels: ["typescript", "fix", "vercel", "env"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
---

# Prompt
The Vercel build failed due to missing `NEXT_PUBLIC_BASE_URL` and `NEXT_PUBLIC_API_BASE_URL` during the static page generation/data collection phase.

# Response
I added default values to `NEXT_PUBLIC_BASE_URL` and `NEXT_PUBLIC_API_BASE_URL` in `todo-frontend/src/utils/env.ts`. This allows the Next.js build process to pass even if these variables are not provided in the environment, as `@t3-oss/env-nextjs` validates them on import.

# Outcome
- Vercel build validation for public environment variables will now pass.
- Successfully pushed the changes to the `main` branch.

# Files Modified
 - todo-frontend/src/utils/env.ts
