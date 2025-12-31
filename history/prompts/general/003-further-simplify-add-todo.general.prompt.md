# PHR: Further simplify AddTodo selects to fix interaction

- ID: 3
- TITLE: Further simplify AddTodo selects to fix interaction
- STAGE: general
- DATE_ISO: 2025-12-30
- SURFACE: agent
- MODEL: gemini-2.0-flash-thinking-exp
- FEATURE: none
- BRANCH: main
- USER: Hadiqa
- COMMAND: solve category and priority not changing in dashboard
- LABELS: ["bugfix", "react", "styling"]
- LINKS: null
- FILES_YAML:
  - todo-frontend/src/app/components/AddTodo.tsx
- TESTS_YAML:
  - none
- PROMPT_TEXT: |
    Not fix priory always medium he change ke bad bhi aur catogory other , change nhi ho rhi fix karo
- RESPONSE_TEXT: |
    I simplified the selects even further, using hardcoded options and adding explicit text colors. I also asked the user for more details on whether other inputs are working to narrow down if it's an overlay issue.
