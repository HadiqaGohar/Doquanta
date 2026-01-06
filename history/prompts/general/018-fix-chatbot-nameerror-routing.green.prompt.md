---
ID: 018
TITLE: Fix Chatbot NameError and Align /api Routes
STAGE: green
DATE_ISO: 2026-01-06
SURFACE: agent
MODEL: gemini-2.0-flash-exp
FEATURE: chatbot-sync
BRANCH: main
USER: hadiqa
COMMAND: fix chatbot demo mode and 404
LABELS: ["chatbot", "routing", "bugfix", "backend", "TaskManager"]
LINKS:
  SPEC: null
  TICKET: null
  ADR: null
  PR: null
FILES_YAML:
  - todo-backend/main.py
  - todo-frontend/src/app/api/chat/ask-ai/route.ts
---

# PROMPT_TEXT
Chatbot was in "demo mode" and returning "Not Found" error. Logs showed 404 for `/register-session` and 403 for task fetch.

# RESPONSE_TEXT
I fixed two major issues:
1. **Chatbot "Demo Mode":** I identified that `task_manager` was being used in `main.py` without being defined in the active code section, causing a `NameError`. I re-added the `TaskManager` and `DatabaseStorage` classes and initialized `task_manager`.
2. **Routing 404s:** I standardized all backend routes (chat, session, ask-ai) under the `/api` prefix and updated the frontend to call these prefixed paths consistently.

# OUTCOME
After backend redeployment, the chatbot will exit demo mode and correctly add tasks. 404 errors for session registration will be resolved.
