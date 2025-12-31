# PHR: Debug 'jwks' Error with Superuser

## Metadata
- **ID**: 011
- **TITLE**: Debug 'jwks' Error with Superuser
- **STAGE**: red
- **DATE_ISO**: 2025-12-29
- **SURFACE**: agent
- **MODEL**: gemini-2.0-flash-thinking-exp
- **FEATURE**: frontend-setup
- **BRANCH**: main
- **USER**: Hadiqa
- **COMMAND**: Change DB user to superuser for debugging
- **LABELS**: ["debug", "postgres", "better-auth", "database"]
- **LINKS**:
  - SPEC: specs/002-phase-2/spec.md

## Evaluation
- **OUTCOME**: Switched the `DATABASE_URL` to use the postgres superuser (`user`) to rule out permission issues as the cause of the `relation "jwks" does not exist` error.
- **FILES**:
  - `todo-frontend/.env` (modified)
- **TESTS**:
  - Manual verification by restarting `npm run dev`.

## Prompt Text
relation "jwks" does not exist (repeated)

## Response Text
The error `relation "jwks" does not exist` is still occurring, even though I've confirmed the table exists and the user has permissions. To eliminate the possibility of a permission issue, I've updated your `.env` file to connect to the database as the superuser (`user`). Please restart `npm run dev` and try again. If the error persists, it strongly suggests the application is connecting to a different database instance than the one we are managing via Docker.
