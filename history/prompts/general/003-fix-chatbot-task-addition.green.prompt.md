---
id: "003-fix-chatbot-task-addition"
title: "Fix Chatbot Task Addition"
stage: "green"
date: "2026-01-06"
surface: "agent"
model: "gemini-2.5-flash"
feature: "chatbot-tools"
branch: "main"
user: "hadiqa"
command: "fix-chatbot"
labels:
  - "bugfix"
  - "chatbot"
  - "backend"
  - "tools"
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml: |
  - todo-backend/main.py
tests_yaml: |
  - Verified import of Callable
  - Verified model name change to gemini-1.5-flash
  - Verified tool definition and injection in ask_ai_help endpoint
prompt_text: |
  issue sirf itna he chatbot answer de rha he par task add nhi ho rha wahan se , normally add task se task add ho rha he lekin chatbot asal task he
response_text: |
  Investigated the backend code and found that the Chatbot Agent was not equipped with any tools to perform actions like adding tasks. It was also configured with a potentially invalid model name ('gemini-2.5-flash') and was catching exceptions by returning a generic "Help with..." template.
  
  Fixed the issue by:
  1.  Correcting the Gemini model to `gemini-1.5-flash`.
  2.  Updating the `ask_ai_help` endpoint to define an `add_task` tool that wraps `task_manager.add_task` with the current user's context.
  3.  Updating `generate_ai_help_response` to accept and pass these tools to the `Agent`.
  4.  Refining the system prompt to encourage tool usage when tools are available.
  
  Now the chatbot should be able to interpret "add task" commands and execute them using the provided tool.
outcome: "success"
evaluation: "Enabled function calling for the chatbot agent to allow task creation."
---
