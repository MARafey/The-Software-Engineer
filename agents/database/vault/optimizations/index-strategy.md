# Index Strategy

(Complements `optimizations/index-guidelines.md`.)

## Target columns
Create indexes on:
- All **foreign keys**.
- Columns frequently used in `WHERE` clauses.
- Columns used in `ORDER BY`.

## Limit
Cap the total number of indexes per table — excess indexes degrade `INSERT`/`UPDATE` speed. Index for real query patterns, not "just in case".
