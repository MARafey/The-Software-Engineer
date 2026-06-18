# Query Patterns

## Batch inserts
```sql
INSERT INTO items (id, name, price) VALUES
  ('1', 'Apple', 0.99),
  ('2', 'Banana', 0.49),
  ('3', 'Cherry', 1.99);
```

## CTEs for readability
```sql
WITH active_users AS (
  SELECT id FROM users WHERE status = 'active'
),
recent_orders AS (
  SELECT * FROM orders WHERE created_at > NOW() - INTERVAL '30 days'
)
SELECT u.id, COUNT(o.id) AS order_count
FROM active_users u
LEFT JOIN recent_orders o ON o.user_id = u.id
GROUP BY u.id;
```

## Pagination (offset vs cursor)
- Offset pagination: simple but slow on large tables (`LIMIT 20 OFFSET 1000`)
- Cursor pagination: `WHERE id > :last_id ORDER BY id LIMIT 20` — preferred for large datasets
