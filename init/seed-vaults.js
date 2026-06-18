'use strict';
/**
 * Seed: writes initial Markdown knowledge base notes into each agent vault.
 * Run after bootstrap: node init/seed-vaults.js
 */
const path = require('path');
const AGENTS_DIR = path.resolve(__dirname, '..');
const { writeNote, updateIndexMd } = require(path.join(AGENTS_DIR, 'shared', 'lib', 'vault'));
const { createLogger } = require(path.join(AGENTS_DIR, 'shared', 'lib', 'logger'));
const log = createLogger('seed');

// ─── Backend vault ────────────────────────────────────────────────────────────
writeNote('backend', 'architecture/express-patterns.md', `# Express.js Patterns

## Middleware order
1. \`cors()\` — always first
2. \`express.json()\` — body parsing
3. \`helmet()\` — security headers
4. Auth middleware (per-router, not global)
5. Route handlers
6. Global error handler (last)

## Feature folder layout
\`\`\`
src/features/<name>/
  routes.js       # exports array of { method, path, handler, middleware[], description, authRequired }
  controller.js   # thin request/response layer — no business logic
  service.js      # all business logic here
  README.md       # what this feature does, endpoints it exposes
\`\`\`

## Error response format
\`\`\`js
{ success: false, code: 'ERR_CODE', message: 'Human readable', details: {} }
\`\`\`
Never leak stack traces. Use a code string for programmatic handling.

## Route contract export
Every routes.js MUST export an array:
\`\`\`js
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
\`\`\`
`);

writeNote('backend', 'patterns/route-template.md', `# Route Template

\`\`\`js
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
\`\`\`

\`\`\`js
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
\`\`\`
`);

writeNote('backend', 'patterns/jsdoc-template.md', `# JSDoc Template

Every exported function must have complete JSDoc:

\`\`\`js
/**
 * @param {string} userId - The authenticated user's UUID
 * @param {Object} data - Validated request body
 * @param {string} data.email - User email address
 * @returns {Promise<{ id: string, email: string }>} Created user record
 * @throws {Error} If email already exists
 */
async function createUser(userId, data) { ... }
\`\`\`
`);

writeNote('backend', 'security/input-validation.md', `# Input Validation

## Rule: Never trust req.body

Use a schema validation middleware before every POST/PUT/PATCH handler.

Recommended: Joi or Zod.

\`\`\`js
const Joi = require('joi');

const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
});
\`\`\`

## Rule: Sanitize before storing
- Trim strings
- Normalize email to lowercase
- Never store plaintext passwords — hash with bcrypt (cost 12+)

## Rule: Parameterized queries only
Never concatenate user input into SQL. Use prepared statements or an ORM.
`);

writeNote('backend', 'security/auth-middleware.md', `# Auth Middleware Pattern

\`\`\`js
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
\`\`\`

Token MUST come from Authorization header. NEVER from query params or request body.
`);

log.ok('backend vault seeded');

// ─── Frontend vault ───────────────────────────────────────────────────────────
writeNote('frontend', 'design-system/tokens.md', `# Design System Tokens

## Colors
Define a CSS custom property palette in :root — never use hardcoded hex values in components.

\`\`\`css
:root {
  --color-primary:    #2563eb;
  --color-secondary:  #7c3aed;
  --color-success:    #16a34a;
  --color-warning:    #d97706;
  --color-error:      #dc2626;
  --color-surface:    #ffffff;
  --color-on-surface: #111827;
  --color-muted:      #6b7280;
  --color-border:     #e5e7eb;
}
\`\`\`

## Typography scale
- xs: 0.75rem / 1rem
- sm: 0.875rem / 1.25rem
- base: 1rem / 1.5rem
- lg: 1.125rem / 1.75rem
- xl: 1.25rem / 1.75rem
- 2xl: 1.5rem / 2rem
- 3xl: 1.875rem / 2.25rem

## Spacing scale (base 4px)
4, 8, 12, 16, 24, 32, 48, 64, 96, 128px
`);

writeNote('frontend', 'state-management/storage-rules.md', `# Storage Sensitivity Rules

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
`);

writeNote('frontend', 'security/bearer-token-rules.md', `# Bearer Token Rules

## Correct
\`\`\`js
// api/auth.api.js — token lives in memory
let _token = null;

export function setToken(t) { _token = t; }
export function clearToken() { _token = null; }

export function authedFetch(url, opts = {}) {
  return fetch(url, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
      Authorization: _token ? \`Bearer \${_token}\` : undefined,
    },
  });
}
\`\`\`

## WRONG — blocks git commit
\`\`\`js
// Never do these:
const token = localStorage.getItem('token');                 // localStorage
fetch('/api/data', { body: JSON.stringify({ token }) });     // token in body
fetch(\`/api/data?token=\${token}\`);                          // token in URL
\`\`\`
`);

writeNote('frontend', 'security/csp-cors.md', `# CSP and CORS

## CSP header (set in backend, not frontend)
\`\`\`
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' <your-api-origin>;
  frame-ancestors 'none';
\`\`\`

## Required security headers
\`\`\`
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
\`\`\`

## CORS (Express)
\`\`\`js
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Authorization', 'Content-Type'],
}));
\`\`\`
NEVER use \`origin: '*'\` when credentials are sent.
`);

writeNote('frontend', 'design-system/component-checklist.md', `# Component Checklist

Before marking a component done:
- [ ] Keyboard navigable (Tab, Enter, Escape, arrow keys where applicable)
- [ ] ARIA attributes: role, aria-label, aria-describedby as needed
- [ ] Responsive: tested at 320px, 768px, 1024px, 1440px
- [ ] Error state: shows meaningful message, not raw API error
- [ ] Loading state: skeleton or spinner, not blank
- [ ] Empty state: shown when list is empty
- [ ] No inline styles — all via CSS variables or utility classes
`);

log.ok('frontend vault seeded');

// ─── Database vault ───────────────────────────────────────────────────────────
writeNote('database', 'optimizations/index-guidelines.md', `# Index Guidelines

## When to add an index
- Any column in a WHERE clause on a table with > 1000 estimated rows
- Any column used in a JOIN condition
- Any column in an ORDER BY on a large table
- Foreign key columns (most databases don't auto-index these)

## When NOT to add an index
- Tables with < 500 rows (full scan is faster)
- Columns with very low cardinality (e.g., boolean flags) — bitmap index instead
- Columns rarely queried

## Covering index
If a query only needs columns A and B, an index on (A, B) avoids a table lookup:
\`\`\`sql
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
-- covers: SELECT status FROM orders WHERE user_id = ?
\`\`\`

## N+1 detection
If you see a query inside a loop, flag it. Propose a batch query:
\`\`\`sql
-- Instead of: SELECT * FROM products WHERE id = ? (in a loop)
-- Use:        SELECT * FROM products WHERE id IN (?, ?, ?)
\`\`\`
`);

writeNote('database', 'optimizations/query-patterns.md', `# Query Patterns

## Batch inserts
\`\`\`sql
INSERT INTO items (id, name, price) VALUES
  ('1', 'Apple', 0.99),
  ('2', 'Banana', 0.49),
  ('3', 'Cherry', 1.99);
\`\`\`

## CTEs for readability
\`\`\`sql
WITH active_users AS (
  SELECT id FROM users WHERE status = 'active'
),
recent_orders AS (
  SELECT * FROM orders WHERE created_at > NOW() - INTERVAL '30 days'
)
SELECT u.id, COUNT(o.id) AS order_count
FROM active_users u
LEFT JOIN recent_orders o ON o.user_id = u.id
GROUP BY u.id;
\`\`\`

## Pagination (offset vs cursor)
- Offset pagination: simple but slow on large tables (\`LIMIT 20 OFFSET 1000\`)
- Cursor pagination: \`WHERE id > :last_id ORDER BY id LIMIT 20\` — preferred for large datasets
`);

log.ok('database vault seeded');

// ─── Testing vault ────────────────────────────────────────────────────────────
writeNote('testing', 'templates/postman-item-template.md', `# Postman Item Template (v2.1)

\`\`\`json
{
  "name": "POST /api/users — positive",
  "request": {
    "method": "POST",
    "header": [
      { "key": "Content-Type", "value": "application/json" },
      { "key": "Authorization", "value": "Bearer {{bearerToken}}" }
    ],
    "body": {
      "mode": "raw",
      "raw": "{ \\"email\\": \\"test@example.com\\", \\"password\\": \\"securePass123\\" }",
      "options": { "raw": { "language": "json" } }
    },
    "url": { "raw": "{{baseUrl}}/api/users", "host": ["{{baseUrl}}"], "path": ["api", "users"] }
  },
  "event": [
    {
      "listen": "test",
      "script": {
        "exec": [
          "pm.test('Status is 201', () => pm.response.to.have.status(201));",
          "pm.test('Response time < 2000ms', () => pm.expect(pm.response.responseTime).to.be.below(2000));",
          "pm.test('success is true', () => { const j = pm.response.json(); pm.expect(j.success).to.be.true; });"
        ]
      }
    }
  ]
}
\`\`\`

## Negative test: invalid payload
- Send missing required fields or wrong types
- Assert status >= 400
- Assert json.success === false

## Auth test: missing token
- Remove Authorization header entirely
- Assert status 401
`);

log.ok('testing vault seeded');

// ─── GitDevOps vault ──────────────────────────────────────────────────────────
writeNote('gitdevops', 'branch-strategy/naming-rules.md', `# Branch Naming Rules

## Pattern
\`<type>/<task-slug>-<sessionId[0..7]>\`

## Types
| Type | When |
|------|------|
| feat | New feature |
| fix | Bug fix |
| chore | Tooling, dependencies, config |
| test | Adding or fixing tests |
| docs | Documentation only |
| refactor | Code restructure, no behavior change |
| security | Security fix or hardening |

## Examples
- \`feat/user-auth-system-a7e88f3b\`
- \`fix/broken-login-route-b3cc12d9\`
- \`security/remove-leaked-key-f0e12345\`

## Rules
- Lowercase only
- Hyphens only (no underscores, no slashes except type separator)
- Slug max 30 characters
- NEVER push directly to main or master — always branch + PR
`);

writeNote('gitdevops', 'commit-format/examples.md', `# Commit Message Examples

## Format
\`\`\`
<type>(<scope>): <subject>    ← max 50 chars, imperative mood, no trailing period

[optional body: what changed and why, 72-char wrap]

[optional footer: BREAKING CHANGE: ..., Closes #N]
\`\`\`

## Good examples
\`\`\`
feat(auth): add JWT refresh token endpoint

Implements POST /api/auth/refresh which validates a refresh token
stored in an httpOnly cookie and issues a new access token.

Closes #42
\`\`\`

\`\`\`
fix(orders): correct total calculation on discounted items

Discount was applied before tax instead of after, causing incorrect
totals when both discount and tax rates were non-zero.
\`\`\`

## Bad examples (rejected by git agent)
\`\`\`
updated stuff          ← no type, vague
Added the new feature. ← trailing period, no scope
WIP                    ← not descriptive
\`\`\`
`);

writeNote('gitdevops', 'security-scans/checklist.md', `# Security Scan Checklist

Runs against \`git diff --staged\` before every commit.

| Severity | Check | Pattern |
|----------|-------|---------|
| blocking | No .env files staged | filename: \`.env\`, \`.env.*\` |
| blocking | No hardcoded secrets | \`API_KEY=\`, \`SECRET=\`, \`PASSWORD=\`, \`PRIVATE_KEY=\` |
| blocking | No raw bearer tokens in source | \`Bearer [A-Za-z0-9._-]{20,}\` |
| blocking | No localhost URLs in non-test files | \`localhost\`, \`127\\.0\\.0\\.1\` |
| blocking | No Authorization header from localStorage | \`localStorage.*Authorization\`, \`Authorization.*localStorage\` |
| blocking | No database credentials in .js/.json | \`DB_PASSWORD\`, \`DATABASE_URL.*password\` |
| blocking | CSP headers defined if frontend files changed | Check backend headers middleware |
| warning | No console.log in production paths | \`console\\.log\` outside test files |
| warning | No commented-out credential strings | \`//.*password\`, \`//.*secret\` |
| info | All new files have README or JSDoc | Check for new files missing header |
`);

log.ok('gitdevops vault seeded');

// ─── MCP Bridge vault ─────────────────────────────────────────────────────────
writeNote('mcpbridge', 'templates/api-stub-template.md', `# Third-Party API Stub Template

\`\`\`js
// src/integrations/<service-name>.js
'use strict';

/**
 * @module <ServiceName>Integration
 * Auth strategy: apiKey | oauth2 | bearerToken | webhook-secret
 */

const BASE_URL = process.env.<SERVICE>_BASE_URL;
const API_KEY  = process.env.<SERVICE>_API_KEY;

/**
 * @param {string} endpoint - API path (e.g. '/v1/messages')
 * @param {Object} opts - fetch options
 * @returns {Promise<any>}
 */
async function request(endpoint, opts = {}) {
  // TODO: implement
  const res = await fetch(\`\${BASE_URL}\${endpoint}\`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Authorization: \`Bearer \${API_KEY}\`,
      ...opts.headers,
    },
  });
  if (!res.ok) {
    throw new Error(\`<ServiceName> API error \${res.status}: \${await res.text()}\`);
  }
  return res.json();
}

module.exports = { request };
\`\`\`
`);

log.ok('mcpbridge vault seeded');

// ─── Update all INDEX.md files ────────────────────────────────────────────────
const AGENT_NAMES = ['backend', 'frontend', 'database', 'testing', 'gitdevops', 'mcpbridge'];
AGENT_NAMES.forEach(name => {
  updateIndexMd(name);
  log.ok(`${name} vault/INDEX.md updated`);
});

console.log('');
log.ok('Seed complete. Run: node init/verify.js');
