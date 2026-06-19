# Database Integration & Migrations (SQLAlchemy + Alembic)

## SQLAlchemy
- **Decoupling**: define models in a dedicated layer, separate from route logic.
- **Sessions**: context-managed; each request opens a session and closes/rolls back on error regardless of outcome.
- **Async/sync**: FastAPI uses `create_async_engine` to avoid blocking the event loop; only legacy Flask uses sync engines.

## Alembic (mandatory for schema changes)
Modifying schema via raw SQL or model edits without a migration is prohibited.

Standard workflow:
1. **Modify** the SQLAlchemy models.
2. **Generate**: `alembic revision --autogenerate -m "description"`.
3. **Review** the generated script (autogenerate is a starting point, not gospel).
4. **Commit** the migration file in the PR.
5. **Deploy**: run `alembic upgrade head` before the service starts.

Use migration scripts for data transformations when a schema change requires modifying existing rows.
