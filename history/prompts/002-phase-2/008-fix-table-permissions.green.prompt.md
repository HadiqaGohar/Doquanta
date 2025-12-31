# PHR: Fix Table Permissions for app_user

## Metadata
- **ID**: 008
- **TITLE**: Fix Table Permissions for app_user
- **STAGE**: green
- **DATE_ISO**: 2025-12-29
- **SURFACE**: agent
- **MODEL**: gemini-2.0-flash-thinking-exp
- **FEATURE**: frontend-setup
- **BRANCH**: main
- **USER**: Hadiqa
- **COMMAND**: Grant permissions to app_user
- **LABELS**: ["postgres", "permissions", "database"]
- **LINKS**:
  - SPEC: specs/002-phase-2/spec.md

## Evaluation
- **OUTCOME**: Resolved "permission denied for table user" error by granting `ALL PRIVILEGES` on all tables and sequences in the `public` schema to `app_user`.
- **FILES**: N/A (database operation)
- **TESTS**:
  - Manual verification for successful sign-in/sign-up.

## Prompt Text
error: permission denied for table user

## Response Text
I resolved the "permission denied for table user" error by granting `ALL PRIVILEGES` on all existing tables and sequences in the `public` schema of the `todo` database to the `app_user`.
Please restart `npm run dev` and try signing in/up again.
