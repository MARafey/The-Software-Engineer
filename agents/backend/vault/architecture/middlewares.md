# Standardized Middlewares (global)

Every backend application implements these globally.

| Middleware | Rule |
|------------|------|
| CORS | Whitelist trusted frontend domains. **Never** wildcard `*` origins in production. |
| Response compression | GZip payloads over a size threshold to cut bandwidth/latency. |
| Host validation | Explicitly allow domains — guards against Host-header attacks and DNS rebinding. |
| Security headers | Inject HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, etc. |
| Observability | APM + metrics (Sentry, Prometheus) to capture unhandled exceptions and latency. |
| Rate limiting | Per-IP request limits to stop abuse, scraping, brute-force. |

## Global authentication middleware
Intercept requests and validate credentials (JWT, API key) before routing.

- **Uniform exceptions**: wrap token validation in try/except; cryptographic/expiry errors return a structured `401` JSON — never let token failures cause a `500`.
- **State injection**: on success, attach the decoded payload to request state (`request.state` / `g`) so handlers don't re-parse the token.
- **Route bypass**: whitelist public routes (`/login`, `/health`, docs endpoints) to skip validation.
