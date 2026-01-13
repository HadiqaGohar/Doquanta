---
id: 008
title: fix-ai-service-init-error
stage: fix
date: 2026-01-11
surface: agent
model: gemini-2.0-flash-exp
feature: ai-service
branch: main
user: Hadiqa
command: fix-ai-tools
labels: [bugfix, ai, openai-agents, deployment]
links: null
files_yaml: |
 - todo-backend/src/main.py
tests_yaml: |
 - python3 -c "from src.main import app" (Passed)
prompt_text: |
 (Context: Deployment failed with container startup error. Local debugging revealed "TypeError: 'FunctionTool' object is not callable" in AIService.__init__)
response_text: |
 Diagnosed and fixed the startup crash preventing Google Cloud deployment.
 
 Issue:
 - `TypeError: 'FunctionTool' object is not callable`
 - In `AIService.__init__`, the tools list was defined as `[self.get_tasks_tool(), ...]` (calling the decorated methods).
 - The `@function_tool` decorator returns an object that shouldn't be called again when passing it to the Agent.
 
 Fix:
 - Removed parentheses: `[self.get_tasks_tool, ...]` (passing the objects/methods directly).
 - Verified locally that `src.main` now imports successfully.
 
 Pushed fix to `main`. Deployment should now succeed.
outcome: fixed
evaluation:
  - checklist:
    - [x] Identify startup error (FunctionTool callable)
    - [x] Fix tool list syntax in main.py
    - [x] Verify local import success
    - [x] Push to main
---
The Cloud Run deployment failed because the container couldn't start. I traced this to a `TypeError` in `src/main.py` where AI tools were being initialized incorrectly. I have fixed the code (removed unnecessary function calls in the tool list), verified it runs locally, and pushed the fix to `main`.
