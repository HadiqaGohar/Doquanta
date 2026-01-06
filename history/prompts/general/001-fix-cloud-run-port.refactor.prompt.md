---
id: 1
title: Fix Cloud Run deployment port error
stage: refactor
date_iso: 2026-01-06
surface: agent
model: gemini-2.0-flash-exp
feature: deployment
branch: main
user: Hadiqa
command: none
labels: ["docker", "cloud-run", "bugfix"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml:
  - todo-backend/Dockerfile
tests_yaml:
  - none
---

## PROMPT_TEXT
google cloud console par ye error a rha he starting build "ff755bee-8e18-4f04-bed6-23fa178568ba"
...
ERROR: (gcloud.run.services.update) The user-provided container failed to start and listen on the port defined provided by the PORT=8080 environment variable within the allocated timeout.

## RESPONSE_TEXT
Fixed the Cloud Run deployment error by updating the Dockerfile to use the dynamic `$PORT` environment variable instead of a hardcoded port 8000.

## OUTCOME
The Dockerfile was modified to include `ENV PORT=8080`, `EXPOSE ${PORT}`, and update the `CMD` to use the `${PORT}` variable. This ensures the application listens on the port expected by Google Cloud Run.
