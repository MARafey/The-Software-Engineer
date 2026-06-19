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

// ── Python stack (added alongside the Node/Express notes — multi-stack) ──
writeNote('backend', 'architecture/python-framework-selection.md', `# Python Framework Selection (FastAPI vs Flask)

Applies when the project is a Python backend. For Node projects, follow \`architecture/express-patterns.md\` instead.

## Choose FastAPI when
- **API-first**: the project's main job is serving a REST/GraphQL API (headless backends, microservices).
- **High concurrency / I/O bound**: many simultaneous connections, websockets, real-time data, heavy external-API or DB calls.
- **Complex validation**: strict, typed validation — FastAPI's native Pydantic integration catches errors before controller logic.
- **Green-field project**: new modern microservices benefit from automatic docs + type-safety.

## Choose Flask when
- **Simple/lightweight prototypes**: small scripts, webhooks, MVPs where Pydantic models would be over-engineering.
- **Legacy integration**: needs older synchronous libraries or Flask-only extensions (Flask-Admin, Flask-Login).
- **Synchronous ML serving**: a thin wrapper around a CPU-bound, synchronous model where high concurrency is not required.

## Default
Green-field → **FastAPI** (async, Pydantic, auto OpenAPI docs).
`);

writeNote('backend', 'architecture/python-server-execution.md', `# Python Server Execution & Process Management

Never use a built-in dev server in production. Use Gunicorn as the process manager.

## Production (Gunicorn)
- **Bind**: \`0.0.0.0:<PORT>\` in containers so the app is reachable.
- **Workers**: \`(2 × NUM_CORES) + 1\`.
- **Log level**: \`info\`.
- **Worker class**:
  - FastAPI (ASGI): \`uvicorn.workers.UvicornWorker\`
  - Flask (WSGI): default sync worker (or \`gevent\`/\`eventlet\` for async I/O)

\`\`\`bash
# FastAPI
gunicorn app.main:app --bind 0.0.0.0:8000 --workers 4 --worker-class uvicorn.workers.UvicornWorker --log-level info

# Flask
gunicorn app.wsgi:app --bind 0.0.0.0:8000 --workers 4 --log-level info
\`\`\`

## Local development
Use the native server with \`--reload\` (never in production — perf + security risk).

\`\`\`bash
# FastAPI
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
# Flask
flask run --host 127.0.0.1 --port 8000 --reload
\`\`\`

Programmatic/IDE debug — bind to the local interface only:
\`\`\`python
if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
\`\`\`
`);

writeNote('backend', 'architecture/middlewares.md', `# Standardized Middlewares (global)

Every backend application implements these globally.

| Middleware | Rule |
|------------|------|
| CORS | Whitelist trusted frontend domains. **Never** wildcard \`*\` origins in production. |
| Response compression | GZip payloads over a size threshold to cut bandwidth/latency. |
| Host validation | Explicitly allow domains — guards against Host-header attacks and DNS rebinding. |
| Security headers | Inject HSTS, \`X-Content-Type-Options: nosniff\`, \`X-Frame-Options: DENY\`, etc. |
| Observability | APM + metrics (Sentry, Prometheus) to capture unhandled exceptions and latency. |
| Rate limiting | Per-IP request limits to stop abuse, scraping, brute-force. |

## Global authentication middleware
Intercept requests and validate credentials (JWT, API key) before routing.

- **Uniform exceptions**: wrap token validation in try/except; cryptographic/expiry errors return a structured \`401\` JSON — never let token failures cause a \`500\`.
- **State injection**: on success, attach the decoded payload to request state (\`request.state\` / \`g\`) so handlers don't re-parse the token.
- **Route bypass**: whitelist public routes (\`/login\`, \`/health\`, docs endpoints) to skip validation.
`);

writeNote('backend', 'patterns/large-file-uploads.md', `# Large File Uploads

Never load an entire large file into memory — it blocks the server and exhausts RAM.

## Patterns
- **Chunked uploads**: client slices the file; backend appends chunks sequentially at calculated byte offsets to disk or cloud storage.
- **Streaming reads**: for single-request uploads, read the request stream in fixed chunks (~5MB) and stream straight to disk or cloud storage — bypass memory loading.
- **Direct-to-bucket**: prefer uploading large files directly to a cloud bucket (e.g. S3) via a one-time presigned URL for upload/download.
`);

writeNote('backend', 'patterns/background-jobs.md', `# Long-Running Jobs & Queuing

Heavy work (media encoding, large dataset parsing, AI inference) must never run synchronously inside the HTTP request cycle.

- In-memory framework queues are **only** for trivial, non-critical tasks (e.g. a single email) — they lose state on restart.
- For anything heavy/long-running use a distributed task queue (Celery + Redis, or equivalent).

## Architecture roles
- **Broker & result backend (Redis)**: holds the pending-job queue and persists final job state/output.
- **Task workers (Celery)**: processes decoupled from the web server; poll the broker, run the workload, report to the result backend.
`);

writeNote('backend', 'patterns/db-integration-sqlalchemy-alembic.md', `# Database Integration & Migrations (SQLAlchemy + Alembic)

## SQLAlchemy
- **Decoupling**: define models in a dedicated layer, separate from route logic.
- **Sessions**: context-managed; each request opens a session and closes/rolls back on error regardless of outcome.
- **Async/sync**: FastAPI uses \`create_async_engine\` to avoid blocking the event loop; only legacy Flask uses sync engines.

## Alembic (mandatory for schema changes)
Modifying schema via raw SQL or model edits without a migration is prohibited.

Standard workflow:
1. **Modify** the SQLAlchemy models.
2. **Generate**: \`alembic revision --autogenerate -m "description"\`.
3. **Review** the generated script (autogenerate is a starting point, not gospel).
4. **Commit** the migration file in the PR.
5. **Deploy**: run \`alembic upgrade head\` before the service starts.

Use migration scripts for data transformations when a schema change requires modifying existing rows.
`);

writeNote('backend', 'patterns/error-handling-logging.md', `# Error Handling & Logging

## Standardized errors
Catch exceptions and transform them into a consistent JSON contract — never expose raw stack traces or internal messages to clients.

\`\`\`json
{
  "status": "error",
  "code": "ERROR_CODE",
  "message": "User-friendly error message"
}
\`\`\`

- **Global handlers**: catch unhandled exceptions at the framework level.
- **Custom exceptions**: domain-specific classes (\`UserNotFound\`, \`InsufficientFunds\`) mapped to HTTP status codes.
- **Log every client error** server-side at \`ERROR\` level, including the traceback.

## Logging
- Use the native \`logging\` library with a JSON formatter, or \`structlog\`.
- **Redact secrets**: filter \`password\`, \`secret\`, \`access_token\`, \`authorization\` from logged request/response objects.

> AI features in a Python backend follow \`shared/standards/ai-agent-practices.md\`.
`);

writeNote('backend', 'patterns/ai-agent-prompt-template.md', `# AI Agent Prompt Template

Used by the **prompt-engineer** sub-agent when a backend task involves an AI/LLM feature
(chatbot, classifier, RAG, tool-using agent). Follows \`shared/standards/ai-agent-practices.md\`.

Build **micro-agents**: one responsibility, narrow scope. Every AI agent MUST define all
nine sections below **before** any code is written. The point is that strict rules and
success criteria are explicit, so downstream workflows don't break on free-form output.

## Required structure
1. **Role & scope** — a single responsibility, stated narrowly.
2. **Relevance guardrail** — check the query is in-scope; if not, return a fixed refusal.
3. **Strict rules** — numbered MUST/NEVER directives.
4. **Few-shot examples** — at least 2 pairs of input → exact expected output.
5. **Output schema** — a strict JSON schema; the only allowed response shape.
6. **Validation loop** — parse output against the schema; on mismatch re-invoke (max N) with the error appended; after N failures return a structured error.
7. **Success criteria** — measurable definition of "the agent worked".
8. **Tool-calling workflow** — if tools are used, force tool use; SQL tools are read-only with \`LIMIT\` + time filters.
9. **Model & observability** — model name from an env var (never hardcode); log every action to a debug log.

## Prompt skeleton (fill every placeholder)
\`\`\`text
ROLE
You are <single-responsibility role>. You only <the one job>.

RELEVANCE GUARDRAIL
Before doing anything, decide if the user input is about <domain>.
If it is NOT, respond exactly with: <fixed polite refusal> and stop.

RULES
1. MUST <...>
2. MUST <...>
3. NEVER <...>

OUTPUT FORMAT
Respond with JSON ONLY, matching the schema below. No prose, no markdown, no code fences.

EXAMPLES
Input: <example input 1>
Output: <exact JSON output 1>

Input: <example input 2>
Output: <exact JSON output 2>
\`\`\`

## Output schema (strict — example)
\`\`\`json
{
  "type": "object",
  "required": ["intent", "confidence"],
  "additionalProperties": false,
  "properties": {
    "intent": { "type": "string", "enum": ["billing", "technical", "account", "other"] },
    "confidence": { "type": "number", "minimum": 0, "maximum": 1 }
  }
}
\`\`\`

## Validation loop (reference implementation)
\`\`\`python
import json, jsonschema

def run_agent(client, prompt, user_input, schema, max_retries=3):
    messages = [{"role": "user", "content": user_input}]
    for attempt in range(max_retries):
        raw = client.complete(system=prompt, messages=messages)  # model name comes from env
        try:
            data = json.loads(raw)
            jsonschema.validate(data, schema)
            return data
        except (json.JSONDecodeError, jsonschema.ValidationError) as e:
            messages.append({"role": "assistant", "content": raw})
            messages.append({"role": "user", "content": f"Invalid output: {e}. Reply with valid JSON only."})
    return {"status": "error", "code": "AGENT_OUTPUT_INVALID", "message": "Agent failed schema after retries"}
\`\`\`

## Success criteria (define per agent)
- 100% of returned outputs parse and validate against the schema.
- Out-of-scope inputs hit the guardrail refusal, not the main logic.
- When a tool is required, the tool is actually called (no hallucinated answers).
- Latency/cost within budget (use a lightweight/"mini" model for basic tasks).

## Worked example — support-ticket classifier
\`\`\`text
ROLE
You are a support-ticket classifier. You only assign one intent label and a confidence score.

RELEVANCE GUARDRAIL
If the input is not a customer support message, respond exactly:
{"intent": "other", "confidence": 0.0}

RULES
1. MUST choose exactly one intent from: billing, technical, account, other.
2. MUST return confidence in [0, 1].
3. NEVER add commentary, apologies, or fields outside the schema.

OUTPUT FORMAT
JSON only, matching the schema.

EXAMPLES
Input: "I was charged twice this month"
Output: {"intent": "billing", "confidence": 0.96}

Input: "The app crashes when I upload a file"
Output: {"intent": "technical", "confidence": 0.93}
\`\`\`

Artifacts produced per AI agent (written into the target project):
- \`src/ai/<agent-name>/prompt.md\` — the full prompt + few-shot examples.
- \`src/ai/<agent-name>/schema.json\` — the strict output schema used by the validation loop.
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

// ── Modern React + TypeScript stack (multi-stack, added alongside existing notes) ──
writeNote('frontend', 'architecture/react-ts-vite-stack.md', `# React + TypeScript + Vite Stack

## Framework & environment
- **React (LTS) with strict TypeScript.** Mixing JavaScript or using \`any\` is prohibited.
- **No Next.js.** Build Client-Side Rendered (CSR) SPAs with **Vite**.
- Use a specific, declared **Node.js LTS** version.
- **UI library**: Ant Design or Material-UI, with custom styles and **framer-motion**.

## tsconfig
- \`"strict": true\`, \`"noImplicitAny": true\`. Type every prop, hook, and API response.
`);

writeNote('frontend', 'architecture/structure-and-state.md', `# Structure & State

## Directory structure (standardized)
\`\`\`
src/
  components/   # presentational + container components
  hooks/        # reusable hooks
  services/     # API clients
  store/        # client state (Context / Redux)
\`\`\`

## Rendering
- Component-level rendering, not full-page re-renders.
- Optimize with \`useMemo\` and \`useCallback\`.

## State
- **Server state**: TanStack Query (React Query) for API caching. Do **not** store raw API data in global client state.
- **Client state**: Context API or Redux for UI state (themes, toggles, etc.).
`);

writeNote('frontend', 'security/web-security-and-validation.md', `# Web Security, Validation & Compliance

(Complements \`security/csp-cors.md\` and \`security/bearer-token-rules.md\`.)

## Security headers (injected by the web server)
\`\`\`
Content-Security-Policy: ...
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), camera=(), microphone=()
\`\`\`

## Dependency & secret checks
- Scan third-party packages (\`npm audit\`, Dependabot) before pushing.
- Check for hardcoded secrets — none in source.

## Config isolation
- All sensitive variables, URLs, endpoints, and ports live strictly in \`.env\` files.

## Validation
- Sanitize special characters and run schema validation (**Zod / Yup + React Hook Form**) on every input that triggers an API.

## Bulk uploads
- Pass CSV/Excel files as **raw payloads** to the backend. Do **not** parse rows on the client — let the backend use SQL \`COPY\`.

## AI & crawlers
- Include \`llms.txt\` and \`robots.txt\` at the project root to manage scrapers.
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

// ── SQL management, prod deployment & vector databases ──
writeNote('database', 'schemas/sql-schema-management.md', `# SQL Schema Management

## Schema files
- **Version control**: store all schema definitions as raw \`.sql\` files in the repo (\`/migrations\` or \`/schema\`).
- **Migration tools**: apply changes via automated tooling (ORM migrations, e.g. Alembic).
- **Execution rule**: never run manual \`CREATE\`/\`ALTER\` statements directly on any environment.

## Mixed data (JSONB — PostgreSQL)
- Use \`jsonb\` **only** when data mixes fixed structured fields with highly dynamic / unpredictable / unstructured nested attributes.
- Do **not** use \`jsonb\` for fields that need strict validation, foreign-key constraints, or heavy relational joins — model those as real columns/tables.
`);

writeNote('database', 'optimizations/index-strategy.md', `# Index Strategy

(Complements \`optimizations/index-guidelines.md\`.)

## Target columns
Create indexes on:
- All **foreign keys**.
- Columns frequently used in \`WHERE\` clauses.
- Columns used in \`ORDER BY\`.

## Limit
Cap the total number of indexes per table — excess indexes degrade \`INSERT\`/\`UPDATE\` speed. Index for real query patterns, not "just in case".
`);

writeNote('database', 'deployment/postgres-docker.md', `# PostgreSQL Production Deployment (Docker Compose)

- **Data persistence**: always use named Docker volumes pinned to a secure host directory.
- **Security**: never hardcode credentials — use an external \`.env\` via \`env_file\`/\`environment\`.
- **Restart policy**: \`restart: unless-stopped\`.

\`\`\`yaml
services:
  postgres_prod:
    image: postgres:18-alpine
    container_name: postgres_prod
    restart: unless-stopped
    environment:
      POSTGRES_USER: \${DB_USER}
      POSTGRES_PASSWORD: \${DB_PASSWORD}
      POSTGRES_DB: \${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
    driver: local
\`\`\`
`);

writeNote('database', 'vector-databases/selection-and-storage.md', `# Vector Databases

## Technology selection
| Tech | Use when |
|------|----------|
| **Chroma** | Prototyping, lightweight Python apps, small datasets (< 100k vectors), minimal config. |
| **Faiss** | Raw, high-performance, in-memory similarity ops; metadata filtering handled externally. |
| **OpenSearch / Elasticsearch** | Enterprise scale, hybrid (keyword + vector) search, fast large-scale metadata filtering. |

## Storing embeddings
- **Normalize** all vectors to unit length before storage (efficient cosine similarity).
- **Index**: HNSW for production (speed/accuracy balance); IVF for highly memory-constrained environments.
- **Minimal metadata**: store only the primary SQL DB id alongside vectors; fetch large text/objects from the relational DB via that id.

## Docker production deployment
- **Resource limits**: explicitly set \`mem_limit\` so index loading can't exhaust host RAM.
- **Network isolation**: keep the vector DB on an internal app network; never expose its ports to the public internet.
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

// ── Deployment guidelines (GitHub flow, Docker, server hardening, docs) ──
writeNote('gitdevops', 'branch-strategy/github-flow.md', `# GitHub Flow (human PR conventions)

> Note: this is the **human-facing** GitHub branching convention. The orchestrator's
> internal agent branches use \`<type>/<slug>-<sessionId>\` (see \`branch-strategy/naming-rules.md\`).
> Use this note when collaborating via GitHub PRs; use \`naming-rules.md\` for automated agent commits.

## Branch naming
- Features: \`feature/<feature-title>\` (e.g. \`feature/user-authentication\`)
- Bug fixes: \`bug/<bug-title>\` or \`fix/<bug-title>\` (e.g. \`bug/login-jwt-expired\`)

## Pull requests
- **Protected branches**: no direct pushes to \`main\` (production).
- **PR required**: all code changes go through a Pull Request.
- **Merge**: use **Squash and merge** to keep a clean history on target branches.
`);

writeNote('gitdevops', 'security-scans/dependency-and-secret-scan.md', `# Pre-Deployment Security Checks

(Extends \`security-scans/checklist.md\`.)

- **Dependency scanning**: run vulnerability checks on third-party packages (\`npm audit\`, Dependabot).
- **Secret detection**: scan the codebase for hardcoded credentials, API keys, or certificates before pushing to remote.
- **AI review**: use AI agents to review the commit for security and performance bugs before merge.
`);

writeNote('gitdevops', 'deployment/docker.md', `# Containerization & Image Optimization

- **Mandatory containerization**: all deployments run in Docker containers — host-level native deployments are forbidden.
- **Multi-stage builds**: separate build dependencies from the final runtime to minimize image size.
- **Numbered tags**: always tag images with explicit version numbers, never \`latest\`.

\`\`\`dockerfile
# Stage 1: Build environment
FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production environment (minimizes image size)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production && npm install pm2 -g
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/ecosystem.config.js ./
EXPOSE 3000
CMD ["npm", "start"]
\`\`\`
`);

writeNote('gitdevops', 'deployment/server-hardening.md', `# Server Hardening

## Firewall (UFW)
- Enable UFW; block all incoming traffic by default.
- Open only required ports: SSH (22), HTTP (80), HTTPS (443).

## SSH security
- Disable password auth in \`/etc/ssh/sshd_config\` (\`PasswordAuthentication no\`).
- Permit access strictly via pre-authorized SSH public keys.

## Intrusion prevention (Fail2Ban)
- Enable the default SSH jail to ban IPs with repeated failed logins.
- Enable Nginx jails: \`nginx-http-auth\`, \`nginx-badbots\`, \`nginx-noscript\`.

## SSL/TLS
- Provision and auto-renew Let's Encrypt certs with Certbot.
- Enforce global HTTP→HTTPS redirect (port 80 → 443) in Nginx.

## Environment
- No Anaconda/Conda on production VMs. Use system Python + \`venv\`, or Docker isolation.
`);

writeNote('gitdevops', 'deployment/repo-docs.md', `# Repository Documentation

- **Location**: store asset files in a \`/docs\` directory at the repo root.
- **Architecture diagram**: keep an up-to-date system diagram showing microservices, databases, and third-party integrations.
- **Code documentation**: maintain \`.md\` docs for the codebase.
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
