---
id: 001
title: fix-chatbot-tool-attribute-error
stage: refactor
date: 2026-01-07
surface: agent
model: gemini-2.0-flash-exp
feature: 001-ai-todo-chatbot
branch: main
user: Hadiqa
command: /fix
labels: ["bugfix", "chatbot", "backend"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - todo-backend/src/main.py
tests:
 - todo-backend/test_fix.py (temporary)
---

## Prompt

chatbot reply nhi kar rha demo mode me he DoQuanta AI Assistant


Hello! I'm your DoQuanta AI assistant. How can I help you today?
01:52 PM


hi
01:52 PM


📚 **Help with: hi**

I encountered an error while processing your request. Please try again later.
01:52 PM


add butter in taks 
01:53 PM


📚 **Help with: add butter in taks **

I encountered an error while processing your request. Please try again later.
01:53 PM

## Response snapshot

Fixed the `AttributeError: 'function' object has no attribute 'name'` in the `ask-ai` endpoint by adding a `.name` attribute to the `add_task` tool function before passing it to the `Agent`. Verified the fix with a reproduction script.

## Outcome

- ✅ Impact: Chatbot now correctly handles tool functions without crashing.
- 🧪 Tests: Verified with temporary test script `todo-backend/test_fix.py`.
- 📁 Files: Modified `todo-backend/src/main.py`.
- 🔁 Next prompts: None
- 🧠 Reflection: The `openai-agents` library likely requires tool objects to have a `name` attribute, which raw Python functions lack. Explicitly setting it solved the issue.

## Evaluation notes (flywheel)

- Failure modes observed: Application crashed when invoking AI with tools.
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): null
