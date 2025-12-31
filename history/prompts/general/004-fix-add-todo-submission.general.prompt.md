# PHR: Fix AddTodo category and priority submission

- ID: 4
- TITLE: Fix AddTodo category and priority submission
- STAGE: general
- DATE_ISO: 2025-12-30
- SURFACE: agent
- MODEL: gemini-2.0-flash-thinking-exp
- FEATURE: none
- BRANCH: main
- USER: Hadiqa
- COMMAND: solve category and priority not changing in dashboard
- LABELS: ["bugfix", "react"]
- LINKS: null
- FILES_YAML:
  - todo-frontend/src/app/components/AddTodo.tsx
- TESTS_YAML:
  - none
- PROMPT_TEXT: |
    Quick Add Task hhhh Add Category 💪 Health Priority Low Priority reult is ---->hhhh 📌 Other Medium
- RESPONSE_TEXT: |
    I updated the handleSubmit function to ensure it uses the current state values for category and priority and added an onSuccess callback to reset the form only after successful creation.
