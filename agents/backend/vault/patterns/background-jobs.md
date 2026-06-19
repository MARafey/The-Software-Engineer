# Long-Running Jobs & Queuing

Heavy work (media encoding, large dataset parsing, AI inference) must never run synchronously inside the HTTP request cycle.

- In-memory framework queues are **only** for trivial, non-critical tasks (e.g. a single email) — they lose state on restart.
- For anything heavy/long-running use a distributed task queue (Celery + Redis, or equivalent).

## Architecture roles
- **Broker & result backend (Redis)**: holds the pending-job queue and persists final job state/output.
- **Task workers (Celery)**: processes decoupled from the web server; poll the broker, run the workload, report to the result backend.
