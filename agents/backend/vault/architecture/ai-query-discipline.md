# AI Query Discipline

When an AI/LLM agent touches the database it must not over-fetch or over-call.

## Rules (enforced by the data-architect)
- **Read-only by default** — AI tools get SELECT-only access; writes go through reviewed services.
- **Always bound results** — `LIMIT` + a time/range filter on every query. No unbounded scans.
- **Never `SELECT *`** — list only the columns the agent needs.
- **Parameterized queries only** — never build SQL by string-concatenating model output.
- **One purposeful query, not many** — avoid N+1; don't re-query for data already in context.
- **Retrieval (RAG):** fetch top-K with a relevance threshold; never pull whole tables into the prompt.
- **Cache hot lookups** (see [[caching-and-lookup-tables]]) so repeated agent calls don't re-hit the DB.
