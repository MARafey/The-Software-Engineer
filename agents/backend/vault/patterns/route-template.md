# Route Template

```js
// src/features/<name>/routes.js
'use strict';
const controller = require('./controller');
const { authenticate } = require('../../middleware/auth');
const { validateBody } = require('../../middleware/validate');
const schema = require('./schema');

module.exports = [
  {
    method: 'GET',
    path: '/api/<name>',
    handler: controller.list,
    middleware: [authenticate],
    description: 'List all <name> records',
    authRequired: true,
  },
  {
    method: 'POST',
    path: '/api/<name>',
    handler: controller.create,
    middleware: [authenticate, validateBody(schema.create)],
    description: 'Create a new <name> record',
    authRequired: true,
  },
];
```

```js
// src/features/<name>/controller.js
'use strict';
const service = require('./service');

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
async function list(req, res) {
  try {
    const data = await service.list(req.user.id);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, code: 'ERR_LIST', message: err.message });
  }
}

module.exports = { list };
```
