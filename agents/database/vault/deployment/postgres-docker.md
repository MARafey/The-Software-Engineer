# PostgreSQL Production Deployment (Docker Compose)

- **Data persistence**: always use named Docker volumes pinned to a secure host directory.
- **Security**: never hardcode credentials — use an external `.env` via `env_file`/`environment`.
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
