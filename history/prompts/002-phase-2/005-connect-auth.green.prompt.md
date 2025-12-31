# PHR: Connect Auth UI to Logic

## Metadata
- **ID**: 005
- **TITLE**: Connect Auth UI to Logic
- **STAGE**: green
- **DATE_ISO**: 2025-12-29
- **SURFACE**: agent
- **MODEL**: gemini-2.0-flash-thinking-exp
- **FEATURE**: frontend-setup
- **BRANCH**: main
- **USER**: Hadiqa
- **COMMAND**: Fix auth wiring and providers
- **LABELS**: ["auth", "react-query", "frontend", "ux"]
- **LINKS**:
  - SPEC: specs/002-phase-2/spec.md

## Evaluation
- **OUTCOME**: Connected the Sign In and Sign Up pages to the `useAuth` hook, enabling actual authentication logic. Fixed cross-linking between pages. Added `ReactQueryClientProvider` and `Toaster` to `RootLayout`.
- **FILES**:
  - `todo-frontend/src/app/layout.tsx` (modified)
  - `todo-frontend/src/app/sign-in/page.tsx` (modified)
  - `todo-frontend/src/app/sign-up/page.tsx` (modified)
- **TESTS**:
  - Manual verification: Sign In and Sign Up forms should now trigger API calls and redirect on success. Toasts should appear.

## Prompt Text
SIgnin sahi nhi he na hi signup ho rha he...

## Response Text
I addressed the reported issues by:
1.  Wrapping the application in `ReactQueryClientProvider` and adding `Toaster` in `src/app/layout.tsx` (required for `useAuth` hook).
2.  Updating `src/app/sign-in/page.tsx` to use the `useAuth` hook for `signIn` and fixing the link to `/sign-up`.
3.  Updating `src/app/sign-up/page.tsx` to use the `useAuth` hook for `signUp` and fixing the link to `/sign-in`.
This connects the UI to the backend logic and enables the expected redirection and feedback.
