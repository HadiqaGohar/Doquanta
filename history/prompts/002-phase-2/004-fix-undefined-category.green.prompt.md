---
id: 004
title: Fix undefined category error
stage: green
date: 2025-12-30
surface: agent
model: gemini-2.0-flash-exp
feature: phase-2
branch: main
user: Hadiqa
command: fix-error
labels: [bugfix, frontend]
links: null
files_yaml:
  - todo-frontend/src/components/tasks/task-item.tsx
tests_yaml: []
---

## Prompt
Solve this error then i will give you next task 

1/1

Next.js 16.1.1
Turbopack
Runtime TypeError

Cannot read properties of undefined (reading 'emoji')
src/components/tasks/task-item.tsx (126:23) @ TaskItem


  124 |           {/* Category */}
  125 |           <span className="text-sm">
> 126 |             {category.emoji} {category.label}
      |                       ^
  127 |           </span>
  128 |
  129 |           {/* Priority */}

## Response
I identified that the backend `Task` model (in `todo-backend/src/models/models.py`) lacks `category` and `priority` fields, but the frontend expects them. This caused `categoryConfig[task.category]` to be undefined, leading to the crash.

I patched `todo-frontend/src/components/tasks/task-item.tsx` to include fallback values:

```typescript
const priority = priorityConfig[task.priority as keyof typeof priorityConfig] || priorityConfig.medium;
const category = categoryConfig[task.category as keyof typeof categoryConfig] || categoryConfig.other;
```

This prevents the runtime crash by defaulting to "Medium" priority and "Other" category when the data is missing.
