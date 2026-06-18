# JSDoc Template

Every exported function must have complete JSDoc:

```js
/**
 * @param {string} userId - The authenticated user's UUID
 * @param {Object} data - Validated request body
 * @param {string} data.email - User email address
 * @returns {Promise<{ id: string, email: string }>} Created user record
 * @throws {Error} If email already exists
 */
async function createUser(userId, data) { ... }
```
