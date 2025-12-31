---
id: 006
title: Complete pending tasks from dashboard
stage: green
date: 2025-12-30
surface: agent
model: gemini-2.0-flash-exp
feature: phase-2
branch: main
user: Hadiqa
command: add-feature
labels: [feature, frontend, dashboard]
links: null
files_yaml:
  - todo-frontend/src/app/dashboard/page.tsx
tests_yaml: []
---

## Prompt
pending task ko complete ka option bhi add karo

## Response
I updated the Dashboard page to allow completing pending tasks directly:
1.  Destructured `toggleTaskCompletion` from `useTasks` hook.
2.  Added a circular check button next to each item in the "Upcoming Tasks" list.
3.  The button marks the task as completed when clicked, which automatically removes it from the "Upcoming" list and updates the stats.
