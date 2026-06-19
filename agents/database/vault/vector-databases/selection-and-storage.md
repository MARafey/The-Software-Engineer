# Vector Databases

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
- **Resource limits**: explicitly set `mem_limit` so index loading can't exhaust host RAM.
- **Network isolation**: keep the vector DB on an internal app network; never expose its ports to the public internet.
