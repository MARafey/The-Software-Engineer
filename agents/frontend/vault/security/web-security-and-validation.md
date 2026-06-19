# Web Security, Validation & Compliance

(Complements `security/csp-cors.md` and `security/bearer-token-rules.md`.)

## Security headers (injected by the web server)
```
Content-Security-Policy: ...
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), camera=(), microphone=()
```

## Dependency & secret checks
- Scan third-party packages (`npm audit`, Dependabot) before pushing.
- Check for hardcoded secrets — none in source.

## Config isolation
- All sensitive variables, URLs, endpoints, and ports live strictly in `.env` files.

## Validation
- Sanitize special characters and run schema validation (**Zod / Yup + React Hook Form**) on every input that triggers an API.

## Bulk uploads
- Pass CSV/Excel files as **raw payloads** to the backend. Do **not** parse rows on the client — let the backend use SQL `COPY`.

## AI & crawlers
- Include `llms.txt` and `robots.txt` at the project root to manage scrapers.
