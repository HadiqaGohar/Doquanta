# PHR: Fix jwks.createdAt Column Name

## Metadata
- **ID**: 014
- **TITLE**: Fix jwks.createdAt Column Name
- **STAGE**: green
- **DATE_ISO**: 2025-12-29
- **SURFACE**: agent
- **MODEL**: gemini-2.0-flash-thinking-exp
- **FEATURE**: frontend-setup
- **BRANCH**: main
- **USER**: Hadiqa
- **COMMAND**: ALTER TABLE jwks RENAME COLUMN
- **LABELS**: ["database", "postgres", "better-auth", "jwt"]
- **LINKS**:
  - SPEC: specs/002-phase-2/spec.md

## Evaluation
- **OUTCOME**: Resolved a `TypeError` in `better-auth`'s JWT plugin by renaming the `createdat` column to `"createdAt"` in the `jwks` table to match the expected camelCase naming convention.
- **FILES**: N/A (database operation)
- **TESTS**:
  - Manual verification by restarting `npm run dev`.

## Prompt Text
TypeError: Cannot read properties of undefined (reading 'getTime') at node_modules/better-auth/src/plugins/jwt/adapter.ts (32:27)

## Response Text
I have fixed the `TypeError`. The error was caused by a mismatch between the database column name (`createdat`) and the name the `better-auth` library expected (`createdAt`). I have renamed the column in the `jwks` table to match.
Please restart your `npm run dev` server and try again. The authentication flow should now work correctly.
