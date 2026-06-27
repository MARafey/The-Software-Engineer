# data-architect

Sub-agent of [[backend]].

**Does:** Designs lean data access: one shared DB pool, read-only AI queries (LIMIT + time filters, no SELECT *), caching and lookup tables.
**Hands off to:** [[route-creator]]
