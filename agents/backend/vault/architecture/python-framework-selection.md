# Python Framework Selection (FastAPI vs Flask)

Applies when the project is a Python backend. For Node projects, follow `architecture/express-patterns.md` instead.

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
