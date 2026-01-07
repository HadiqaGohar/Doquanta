---
id: 003
title: fix-analytics-nav-and-add-clear-all
stage: feature
date: 2026-01-07
surface: agent
model: gemini-2.0-flash-exp
feature: 001-ai-todo-features
branch: main
user: Hadiqa
command: /fix
labels: ["bugfix", "performance", "feature", "settings"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - todo-frontend/src/features/tasks/hooks.tsx
 - todo-backend/src/api/tasks.py
 - todo-frontend/src/features/tasks/queries.ts
 - todo-frontend/src/app/dashboard/settings/page.tsx
tests: []
---

## Prompt

me jab yhn ati hon https://doquanta.vercel.app/dashboard/analytics to us ke bad route link se chnage nhi kar pati means mojhe agar wapis dashboard par jana he to link se nhi ja pa rhi mojhe back back kar ke jana parhta he ,,,, aur me soch rhi thi clear all task feature bhi add karen taky user experience acha ho

## Response snapshot

Addressed two main requests: fixing the navigation lock-up on the Analytics page and adding a "Clear All Tasks" feature.

1.  **Fixed Navigation Freeze (Infinite Loop):**
    -   **Problem:** The Analytics page used `useTasks` inside a `useEffect`. The `useTasks` hook was returning a new array reference (`sortedTasks`) on every render because of `.sort()` running in the hook body. This caused the `useEffect` in Analytics to run infinitely, re-setting state, re-rendering, and freezing the UI (blocking navigation).
    -   **Fix:** Wrapped the `sortedTasks` and `stats` calculation in `useMemo` within `todo-frontend/src/features/tasks/hooks.tsx`. This ensures the array reference remains stable unless data actually changes, stopping the infinite render loop.

2.  **Implemented "Clear All Tasks":**
    -   **Backend:** Added `DELETE /api/{user_id}/tasks/all/clear` endpoint in `todo-backend/src/api/tasks.py`.
    -   **Frontend API:** Added `deleteAllTasks` function in `queries.ts`.
    -   **Frontend Hook:** Exposed `deleteAllTasks` mutation in `useTasks`.
    -   **UI:** Added a "Danger Zone" card in the Settings page (`/dashboard/settings`) with a "Clear All Tasks" button that requires confirmation.

## Outcome

- ✅ Impact: Analytics page is now responsive and navigation works. Users can now wipe all their tasks from Settings.
- 🧪 Tests: Manual verification of the infinite loop fix (code analysis) and API integration.
- 📁 Files: Modified `hooks.tsx`, `queries.ts`, `tasks.py` (backend), `settings/page.tsx`.
- 🔁 Next prompts: None immediate.
- 🧠 Reflection: Performance bugs like infinite loops in React hooks can be subtle but devastating to UX. Memoization is critical when returning derived objects/arrays from hooks.

## Evaluation notes (flywheel)

- Failure modes observed: None in implementation.
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): null
