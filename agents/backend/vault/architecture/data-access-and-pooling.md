# Data Access & Connection Pooling

Goal: never overload the database. One application, one shared pool.

## Single shared pool
- Initialize the DB connection/pool ONCE at startup (a singleton module) and import it everywhere.
- Never call `new Pool()` / `createConnection()` per request, per route, or inside a loop.
- Node/pg: a single `Pool` with `max` sized to the DB's connection limit (e.g. 10–20), plus `idleTimeoutMillis` and `connectionTimeoutMillis`.
- Python/SQLAlchemy: one `Engine` (it owns the pool) created once; sessions are short-lived and returned to the pool.
- Serverless / many instances: put a pooler in front (PgBouncer / RDS Proxy / Supabase pooler) — direct pools exhaust fast.

## Avoid exhaustion
- Always release/return connections (try/finally, or a context manager).
- Keep transactions short; never hold a connection open across an external or AI/LLM call.
- Cap concurrency so in-flight queries never exceed the pool size.
