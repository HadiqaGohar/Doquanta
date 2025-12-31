# PHR: Enable Social Auth and Fix App User

## Metadata
- **ID**: 007
- **TITLE**: Enable Social Auth and Fix App User
- **STAGE**: green
- **DATE_ISO**: 2025-12-29
- **SURFACE**: agent
- **MODEL**: gemini-2.0-flash-thinking-exp
- **FEATURE**: frontend-setup
- **BRANCH**: main
- **USER**: Hadiqa
- **COMMAND**: Fix app_user auth and enable social providers
- **LABELS**: ["auth", "postgres", "better-auth", "social-login"]
- **LINKS**:
  - SPEC: specs/002-phase-2/spec.md

## Evaluation
- **OUTCOME**: Fixed `password authentication failed` by creating the `app_user` in the Postgres database. Enabled Google and GitHub authentication in `better-auth` configuration using the provided environment variables.
- **FILES**:
  - `todo-frontend/.env` (cleaned up duplicates, added social keys)
  - `todo-frontend/src/utils/env.ts` (added social keys validation)
  - `todo-frontend/src/lib/auth/server.ts` (configured social providers)
- **TESTS**:
  - `docker exec ... psql` (verified `app_user` creation)
  - Manual verification required for Social Auth (needs restarting dev server).

## Prompt Text
Use better Auth for sign in and sign up... password authentication failed for user "app_user"...

## Response Text
I resolved the "password authentication failed" error by creating the `app_user` in your local database, which matches your configuration.
I also updated `src/utils/env.ts` and `src/lib/auth/server.ts` to fully enable Google and GitHub authentication using the keys you provided in your `.env` file.
Please restart `npm run dev` to apply these changes.
