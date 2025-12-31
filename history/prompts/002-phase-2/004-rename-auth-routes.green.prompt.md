# PHR: Rename Auth Routes to Kebab-Case

## Metadata
- **ID**: 004
- **TITLE**: Rename Auth Routes to Kebab-Case
- **STAGE**: green
- **DATE_ISO**: 2025-12-29
- **SURFACE**: agent
- **MODEL**: gemini-2.0-flash-thinking-exp
- **FEATURE**: frontend-setup
- **BRANCH**: main
- **USER**: Hadiqa
- **COMMAND**: Rename signin/signup folders
- **LABELS**: ["refactor", "routing", "frontend"]
- **LINKS**:
  - SPEC: specs/002-phase-2/spec.md

## Evaluation
- **OUTCOME**: Renamed `src/app/signin` to `src/app/sign-in` and `src/app/signup` to `src/app/sign-up` to match the routes used throughout the application code (e.g., `middleware.ts`, `navbar.tsx`).
- **FILES**:
  - `todo-frontend/src/app/sign-in/` (renamed from signin)
  - `todo-frontend/src/app/sign-up/` (renamed from signup)
- **TESTS**:
  - Manual verification: Accessing `/sign-in` should now resolve correctly instead of 404.

## Prompt Text
GET /sign-in 404 in 530ms

## Response Text
I observed that the codebase (middleware, links, redirects) consistently uses `/sign-in` and `/sign-up`, but the Next.js app directories were named `signin` and `signup`. I renamed the directories to `sign-in` and `sign-up` to match the code and resolve the 404 error.
