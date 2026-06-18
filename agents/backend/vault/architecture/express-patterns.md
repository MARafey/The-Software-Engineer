# Express.js Patterns

## Middleware order
1. `cors()` — always first
2. `express.json()` — body parsing
3. `helmet()` — security headers
4. Auth middleware (per-router, not global)
5. Route handlers
6. Global error handler (last)

## Feature folder layout
```
src/features/<name>/
  routes.js       # exports array of { method, path, handler, middleware[], description, authRequired }
  controller.js   # thin request/response layer — no business logic
  service.js      # all business logic here
  README.md       # what this feature does, endpoints it exposes
```

## Error response format
```js
{ success: false, code: 'ERR_CODE', message: 'Human readable', details: {} }
```
Never leak stack traces. Use a code string for programmatic handling.

## Route contract export
Every routes.js MUST export an array:
```js
module.exports = [
  {
    method: 'POST',
    path: '/api/users',
    handler: require('./controller').createUser,
    middleware: [validateBody(createUserSchema)],
    description: 'Create a new user account',
    requestBodySchema: { email: 'string', password: 'string' },
    responseSchema: { success: true, data: { id: 'string', email: 'string' } },
    authRequired: false,
  },
];
```
