---
id: 11
title: Fix dashboard hang by adding timeout to session registration
stage: green
date_iso: 2026-01-06
surface: agent
model: gemini-2.0-flash-exp
feature: auth
branch: main
user: Hadiqa
command: none
labels: ["dashboard", "fix", "reliability"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml:
  - todo-frontend/src/utils/auth.ts
tests_yaml:
  - none
---

## PROMPT_TEXT
User reported dashboard hanging on "Loading...".

## RESPONSE_TEXT
Modified `ensureSessionRegistered` to be more robust, including a 5-second timeout and more flexible token detection. This prevents the entire dashboard from being blocked if the backend session registration endpoint hangs or fails.

## OUTCOME
The dashboard should now load even if the backend registration has issues, improving the user experience and allowing for better debugging of task fetching.
