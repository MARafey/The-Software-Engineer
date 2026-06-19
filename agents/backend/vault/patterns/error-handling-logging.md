# Error Handling & Logging

## Standardized errors
Catch exceptions and transform them into a consistent JSON contract — never expose raw stack traces or internal messages to clients.

```json
{
  "status": "error",
  "code": "ERROR_CODE",
  "message": "User-friendly error message"
}
```

- **Global handlers**: catch unhandled exceptions at the framework level.
- **Custom exceptions**: domain-specific classes (`UserNotFound`, `InsufficientFunds`) mapped to HTTP status codes.
- **Log every client error** server-side at `ERROR` level, including the traceback.

## Logging
- Use the native `logging` library with a JSON formatter, or `structlog`.
- **Redact secrets**: filter `password`, `secret`, `access_token`, `authorization` from logged request/response objects.

> AI features in a Python backend follow `shared/standards/ai-agent-practices.md`.
