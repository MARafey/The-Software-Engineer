# Index Guidelines

## When to add an index
- Any column in a WHERE clause on a table with > 1000 estimated rows
- Any column used in a JOIN condition
- Any column in an ORDER BY on a large table
- Foreign key columns (most databases don't auto-index these)

## When NOT to add an index
- Tables with < 500 rows (full scan is faster)
- Columns with very low cardinality (e.g., boolean flags) — bitmap index instead
- Columns rarely queried

## Covering index
If a query only needs columns A and B, an index on (A, B) avoids a table lookup:
```sql
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
-- covers: SELECT status FROM orders WHERE user_id = ?
```

## N+1 detection
If you see a query inside a loop, flag it. Propose a batch query:
```sql
-- Instead of: SELECT * FROM products WHERE id = ? (in a loop)
-- Use:        SELECT * FROM products WHERE id IN (?, ?, ?)
```
