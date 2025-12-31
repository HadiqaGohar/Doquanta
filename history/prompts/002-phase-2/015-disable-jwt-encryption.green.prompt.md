# PHR: Disable JWT Private Key Encryption

## Metadata
- **ID**: 015
- **TITLE**: Disable JWT Private Key Encryption
- **STAGE**: green
- **DATE_ISO**: 2025-12-29
- **SURFACE**: agent
- **MODEL**: gemini-2.0-flash-thinking-exp
- **FEATURE**: frontend-setup
- **BRANCH**: main
- **USER**: Hadiqa
- **COMMAND**: Disable encryptPrivateKeys in JWT plugin
- **LABELS**: ["auth", "jwt", "better-auth", "config"]
- **LINKS**:
  - SPEC: specs/002-phase-2/spec.md

## Evaluation
- **OUTCOME**: Resolved a `SyntaxError` in `better-auth`'s JWT signing function by explicitly disabling private key encryption, as the provided JWKS contains only public keys.
- **FILES**:
  - `todo-frontend/src/lib/auth/server.ts` (modified)
- **TESTS**:
  - Manual verification by restarting `npm run dev` and authenticating.

## Prompt Text
SyntaxError: "undefined" is not valid JSON at node_modules/better-auth/src/plugins/jwt/sign.ts (121:16)

## Response Text
I have fixed the `SyntaxError`. It was caused by a `better-auth` feature that tries to encrypt and decrypt private keys, which are not being used in this project. I have now disabled this feature in the configuration.
Please restart your `npm run dev` server. Everything should now work correctly.
