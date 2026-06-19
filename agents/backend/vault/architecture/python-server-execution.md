# Python Server Execution & Process Management

Never use a built-in dev server in production. Use Gunicorn as the process manager.

## Production (Gunicorn)
- **Bind**: `0.0.0.0:<PORT>` in containers so the app is reachable.
- **Workers**: `(2 × NUM_CORES) + 1`.
- **Log level**: `info`.
- **Worker class**:
  - FastAPI (ASGI): `uvicorn.workers.UvicornWorker`
  - Flask (WSGI): default sync worker (or `gevent`/`eventlet` for async I/O)

```bash
# FastAPI
gunicorn app.main:app --bind 0.0.0.0:8000 --workers 4 --worker-class uvicorn.workers.UvicornWorker --log-level info

# Flask
gunicorn app.wsgi:app --bind 0.0.0.0:8000 --workers 4 --log-level info
```

## Local development
Use the native server with `--reload` (never in production — perf + security risk).

```bash
# FastAPI
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
# Flask
flask run --host 127.0.0.1 --port 8000 --reload
```

Programmatic/IDE debug — bind to the local interface only:
```python
if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
```
