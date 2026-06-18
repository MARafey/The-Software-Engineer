# Code Standards

Enforced by the code-standards sub-agent of the backend agent, and the folder-structure sub-agent.

## File organization

Every feature lives in its own folder:
```
src/features/<feature-name>/
  routes.js      — exports route contract array
  controller.js  — thin request/response layer
  service.js     — all business logic
  schema.js      — Joi/Zod validation schemas
  README.md      — what this feature does, its endpoints
```

The folder-structure sub-agent:
1. Verifies this layout exists for every feature
2. Creates missing files using the templates from the backend vault
3. Ensures every feature folder has a README.md

## Commenting rules

Add a comment only when the WHY is non-obvious:
- A hidden constraint or invariant
- A workaround for a specific external bug
- Behavior that would surprise a reader

Do NOT comment:
- What the code does (well-named identifiers do this)
- Which task or issue this was added for (belongs in the commit message)

## JSDoc requirements (backend)

Every exported function must have:
```js
/**
 * @param {Type} paramName - description
 * @returns {Promise<Type>} description
 * @throws {Error} when X happens
 */
```

## Naming conventions

- **Files**: `kebab-case.js`
- **Variables/functions**: `camelCase`
- **Classes**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Database tables**: `snake_case`
- **API routes**: `/api/kebab-case/:id`

## Error handling

Backend: every async route handler wrapped in try/catch. Format:
```js
{ success: false, code: 'ERR_CODE', message: 'Human readable', details: {} }
```

Frontend: every API call shows a user-friendly error, never a raw status code or stack trace.

## README requirements per folder

Minimum content:
```markdown
# <Feature Name>

Brief description of what this feature does.

## Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST   | /api/<name> | Yes | ... |

## Dependencies
List any external services, tables, or other features this depends on.
```
