# SQL Schema Management

## Schema files
- **Version control**: store all schema definitions as raw `.sql` files in the repo (`/migrations` or `/schema`).
- **Migration tools**: apply changes via automated tooling (ORM migrations, e.g. Alembic).
- **Execution rule**: never run manual `CREATE`/`ALTER` statements directly on any environment.

## Mixed data (JSONB — PostgreSQL)
- Use `jsonb` **only** when data mixes fixed structured fields with highly dynamic / unpredictable / unstructured nested attributes.
- Do **not** use `jsonb` for fields that need strict validation, foreign-key constraints, or heavy relational joins — model those as real columns/tables.
