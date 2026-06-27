# Caching & Lookup Tables

Reduce database load by not asking the same question twice.

## Caching
- Cache read-heavy, slow-changing data (config, reference lists, computed aggregates).
- Layer: in-memory (per-process) for tiny hot data; Redis for shared/multi-instance state.
- Set TTLs; invalidate on write (write-through, or an explicit bust in the mutating service).
- Cache keys must include all query params; never cache per-user data under a shared key.

## Lookup / reference tables
- Move enums and repeated reference data into lookup tables (or cached maps) to avoid repeated joins.
- Preload small lookups into memory at startup.
- Add covering indexes for the lookup access paths.
