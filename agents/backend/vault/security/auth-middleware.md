# Auth Middleware Pattern

```js
// src/middleware/auth.js
const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, code: 'ERR_NO_TOKEN', message: 'Missing bearer token' });
  }
  try {
    req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ success: false, code: 'ERR_INVALID_TOKEN', message: 'Invalid or expired token' });
  }
}

module.exports = { authenticate };
```

Token MUST come from Authorization header. NEVER from query params or request body.
