# Tasks: Phase II - Full-Stack Todo Web Application

## Phase 1: Setup & Configuration
- [ ] T001 Update `CLAUDE.md` to reflect Phase II architecture.
- [ ] T002 Configure `todo-backend` dependencies (FastAPI, SQLModel, Uvicorn, etc.) in `pyproject.toml`.
- [ ] T003 Initialize `todo-frontend` with Next.js 16, TypeScript, and Tailwind.
- [ ] T004 Create `.env` templates for both backend and frontend.

## Phase 2: Backend Core & Models
- [ ] T005 Implement Database connection logic in `todo-backend/src/db/session.py`.
- [ ] T006 Define `Task` and `User` SQLModel classes in `todo-backend/src/models/`.
- [ ] T007 Implement JWT verification dependency in `todo-backend/src/core/security.py`.
- [ ] T008 Create database migration/initialization script.

## Phase 3: Backend API Implementation
- [ ] T009 Implement `POST /api/{user_id}/tasks` (Create Task).
- [ ] T010 Implement `GET /api/{user_id}/tasks` (List Tasks with filters).
- [ ] T011 Implement `GET /api/{user_id}/tasks/{id}` (Get Task).
- [ ] T012 Implement `PUT /api/{user_id}/tasks/{id}` (Update Task).
- [ ] T013 Implement `DELETE /api/{user_id}/tasks/{id}` (Delete Task).
- [ ] T014 Implement `PATCH /api/{user_id}/tasks/{id}/complete` (Toggle Status).

## Phase 4: Frontend Authentication
- [ ] T015 Setup Better Auth configuration in `todo-frontend/src/lib/auth.ts`.
- [ ] T016 Create Sign-Up page `todo-frontend/src/app/(auth)/signup/page.tsx`.
- [ ] T017 Create Login page `todo-frontend/src/app/(auth)/login/page.tsx`.
- [ ] T018 Implement protected route middleware.

## Phase 5: Frontend Dashboard & Integration
- [ ] T019 Create API client wrapper in `todo-frontend/src/lib/api.ts` (handling JWT).
- [ ] T020 Build `TaskCard` and `TaskList` components.
- [ ] T021 Build `CreateTaskForm` component.
- [ ] T022 Implement Dashboard page `todo-frontend/src/app/dashboard/page.tsx` integrating all components.
- [ ] T023 Add toast notifications and loading states.

## Phase 6: Verification & Polish
- [ ] T024 Verify end-to-end flow: Sign up -> Login -> Create Task -> View Task.
- [ ] T025 Ensure mobile responsiveness.
- [ ] T026 Audit code for security (JWT handling, ownership checks).
- [ ] T027 Update documentation with run instructions.