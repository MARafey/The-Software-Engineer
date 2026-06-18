# Input Validation

## Rule: Never trust req.body

Use a schema validation middleware before every POST/PUT/PATCH handler.

Recommended: Joi or Zod.

```js
const Joi = require('joi');

const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
});
```

## Rule: Sanitize before storing
- Trim strings
- Normalize email to lowercase
- Never store plaintext passwords — hash with bcrypt (cost 12+)

## Rule: Parameterized queries only
Never concatenate user input into SQL. Use prepared statements or an ORM.
