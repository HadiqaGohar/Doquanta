# PHR: Create and Populate JWKS Table

## Metadata
- **ID**: 010
- **TITLE**: Create and Populate JWKS Table
- **STAGE**: green
- **DATE_ISO**: 2025-12-29
- **SURFACE**: agent
- **MODEL**: gemini-2.0-flash-thinking-exp
- **FEATURE**: frontend-setup
- **BRANCH**: main
- **USER**: Hadiqa
- **COMMAND**: Create and populate jwks table
- **LABELS**: ["postgres", "jwt", "better-auth", "migrations"]
- **LINKS**:
  - SPEC: specs/002-phase-2/spec.md

## Evaluation
- **OUTCOME**: Resolved the "relation 'jwks' does not exist" error by creating the `jwks` table and inserting the keys from `help-phase-02/backend/jwks.json`.
- **FILES**: N/A (database operation)
- **TESTS**:
  - `docker exec ... psql` (verified table creation and inserts)

## Prompt Text
relation "jwks" does not exist

## Response Text
I resolved the `relation "jwks" does not exist` error by:
1.  Creating the `jwks` table in your local database with the schema expected by `better-auth`.
2.  Populating the `jwks` table with the keys found in `help-phase-02/backend/jwks.json`.
Please restart `npm run dev` and try signing in/up again.
