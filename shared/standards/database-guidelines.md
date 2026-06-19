# Database Guidelines

Cross-agent reference for relational and vector databases. The database agent owns
enforcement; backend and mcpbridge agents consult this for integration decisions.

## 1. SQL databases

### Schema files
- **Version control**: store all schema definitions as raw `.sql` files in the repo
  (`/migrations` or `/schema`).
- **Migration tools**: apply changes via automated ORM migrations (e.g. Alembic).
- **Execution rule**: never run manual `CREATE`/`ALTER` statements directly on any
  environment.

### Mixed data (JSONB)
- Use `jsonb` (PostgreSQL) **only** when data mixes fixed structured fields with highly
  dynamic, unpredictable, or unstructured nested attributes.
- Do **not** use `jsonb` for fields that need strict validation, foreign-key constraints,
  or heavy relational joins.

### Indexes
- Index all foreign keys, columns frequently used in `WHERE`, and columns used in
  `ORDER BY`.
- Cap total indexes per table — too many degrade `INSERT`/`UPDATE` speed.

### Production deployment (Docker Compose)
- **Data persistence**: named Docker volumes pinned to a secure host directory.
- **Security**: never hardcode credentials; load an external `.env` via `env_file`/
  `environment`.
- **Restart policy**: `restart: unless-stopped`.

```yaml
services:
  postgres_prod:
    image: postgres:18-alpine
    container_name: postgres_prod
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
    driver: local
```

## 2. Vector databases

### Technology selection
- **Chroma**: prototyping, lightweight Python apps, small datasets (< 100k vectors),
  minimal config.
- **Faiss**: raw, high-performance in-memory similarity ops; metadata filtering handled
  externally.
- **OpenSearch / Elasticsearch**: enterprise scale, hybrid (keyword + vector) search,
  fast large-scale metadata filtering.

### Storing embeddings
- **Normalize** vectors to unit length before storage (efficient cosine similarity).
- **Index**: HNSW for production; IVF for highly memory-constrained environments.
- **Minimal metadata**: store only the primary SQL DB id alongside vectors; fetch large
  text/objects from the relational DB via that id.

### Docker production deployment
- **Resource allocation**: explicitly set `mem_limit` so index loading can't exhaust host
  RAM.
- **Network isolation**: keep the vector DB on an internal app network; never expose its
  ports to the public internet.
