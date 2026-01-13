---
id: 009
title: fix-runner-keyword-argument
stage: fix
date: 2026-01-11
surface: agent
model: gemini-2.0-flash-exp
feature: ai-service
branch: main
user: Hadiqa
command: fix-runner-arg
labels: [bugfix, ai, openai-agents, signature-mismatch]
links: null
files_yaml: |
 - todo-backend/src/main.py
tests_yaml: |
 - manual verification via logs (deployment succeeded, runtime error caught)
 - python3 -c "inspect signature" (confirmed starting_agent)
prompt_text: |
 Error in AI processing with Gemini: Runner.run() got an unexpected keyword argument 'agent'
response_text: |
 Fixed a runtime error in the AI service integration.
 
 Issue:
 - `Runner.run()` was raising `TypeError: unexpected keyword argument 'agent'`.
 - Inspection of the `openai-agents` library revealed the correct argument name is `starting_agent`, not `agent`.
 
 Fix:
 - Updated `Runner.run(agent=self.agent, ...)` to `Runner.run(starting_agent=self.agent, ...)` in `src/main.py`.
 
 Pushed fix to `main`. The AI chatbot should now function correctly without crashing on the backend.
outcome: fixed
evaluation:
  - checklist:
    - [x] Inspect library signature
    - [x] Correct keyword argument in main.py
    - [x] Push to main
---
I have fixed the `unexpected keyword argument 'agent'` error by updating the `Runner.run` call to use `starting_agent` instead of `agent`, as required by the library. I pushed the changes to `main`.
