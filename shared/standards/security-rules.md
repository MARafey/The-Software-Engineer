# Security Rules

Rules enforced by the Git/DevOps agent on every commit. Blocking rules prevent the commit from proceeding.

## Blocking rules (commit rejected if violated)

1. **No .env files staged**
   - Pattern: filename matches `.env`, `.env.*`, `*.env`
   - Use environment variables injected at runtime

2. **No hardcoded secrets in source**
   - Pattern: `API_KEY=`, `SECRET=`, `PASSWORD=`, `PRIVATE_KEY=` followed by a non-empty value
   - Use `process.env.YOUR_KEY` and `.env` loaded via dotenv (not committed)

3. **No raw JWT or bearer tokens in source**
   - Pattern: `Bearer [A-Za-z0-9._-]{20,}` anywhere in a committed file
   - Tokens are runtime values — they never belong in source code

4. **No localhost/127.0.0.1 URLs in non-test files**
   - Pattern: `localhost`, `127.0.0.1` outside of `*.test.js` / `*.spec.js`
   - Use environment variables for base URLs

5. **No Authorization header built from localStorage**
   - Pattern: `localStorage.*token` adjacent to `Authorization`
   - Tokens must live in memory, not localStorage

6. **No database credentials in .js or .json files**
   - Pattern: `DB_PASSWORD`, `DATABASE_URL` with embedded password
   - Use env vars for all database connection strings

7. **CSP headers must be present if frontend files changed**
   - If any file under `src/` (frontend) is modified, backend middleware must define CSP headers

## Warning rules (commit proceeds, team notified)

8. **No console.log in production code paths**
   - Allowed in `*.test.js`, `*.spec.js`, `init/`, `scripts/`
   - Production code uses a structured logger

9. **No commented-out credential-shaped strings**
   - Pattern: `//.*password`, `//.*secret`, `//.*api.key`

## Info rules (advisory only)

10. **New files should have a README or JSDoc header**
    - New `.js` files in feature folders should have a top-level JSDoc or `/* ... */` block
    - New feature folders should have a `README.md`

## Frontend-specific rules

- Auth tokens: `Authorization` header only — never `localStorage`, never in request body or URL
- Session data: `sessionStorage` or in-memory — never `localStorage`
- Sensitive PII: never stored client-side at all
- No `eval()`, `innerHTML =` with user data, or `document.write()`

## Backend-specific rules

- All user input must be validated before use (Joi, Zod, Pydantic, or equivalent)
- All SQL uses parameterized queries (no string concatenation)
- Error responses never include stack traces
- JWT verified with `jwt.verify()` (or equivalent) — never decoded without verification

## Required web security headers

Web servers / backend middleware must inject all of the following on responses:

- `Content-Security-Policy`
- `Strict-Transport-Security`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy`
- `Permissions-Policy`

## Dependency & secret scanning (pre-deployment)

- **Dependency scanning**: run vulnerability checks on third-party packages
  (`npm audit`, Dependabot) before pushing code.
- **Secret detection**: scan the codebase for hardcoded credentials, API keys, or
  certificates before any push to a remote repository.
- **AI review**: use AI agents to review the commit for security and performance bugs.

See `shared/standards/deployment-guidelines.md` for the full pre-deployment and
server-hardening checklist.
