---
id: 7
title: Updated verce.md with correct production values
stage: refactor
date_iso: 2026-01-06
surface: agent
model: gemini-2.0-flash-exp
feature: deployment
branch: main
user: Hadiqa
command: none
labels: ["documentation", "env-vars", "bugfix"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml:
  - verce.md
tests_yaml:
  - none
---

## PROMPT_TEXT
vercel.md read karo whn ye variable hengy mene list banadi he

## RESPONSE_TEXT
Corrected the user's `verce.md` file because it contained local/development values that would not work in production. Replaced them with the discovered Neon database URL and correct public base URLs.

## OUTCOME
User now has a reliable list of environment variables in `verce.md` to copy into Vercel.
