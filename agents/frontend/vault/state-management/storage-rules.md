# Storage Sensitivity Rules

| Data type              | Allowed storage                          | Forbidden                  |
|------------------------|------------------------------------------|----------------------------|
| Auth tokens (JWT/session) | Authorization header only (memory)   | localStorage, sessionStorage, URL |
| Session identity       | sessionStorage or in-memory state        | localStorage               |
| User preferences       | localStorage                             | —                          |
| App / UI state         | Redux, Zustand, Context                  | window.*, global vars      |
| Sensitive PII          | Never stored client-side                 | Any client storage         |

## Implementation rules
1. Tokens are stored in a module-level variable after login, cleared on logout/refresh.
2. API calls inject the token from the in-memory store, not from any DOM or storage API.
3. On page reload, the user must re-authenticate (no persistent token in storage).
   Exception: "remember me" flows — store a refresh token in an httpOnly cookie (server-set), never in JS-accessible storage.
