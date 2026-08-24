# PostgreSQL sequence for SKU generation

SKU values (`VIN-000001`, `VIN-000002`, ...) are generated using a dedicated PostgreSQL sequence (`sku_seq`) rather than application-level `COUNT(*)` or `MAX(sku)` queries.

A sequence is atomically incremented by the database engine, making it safe under concurrent inserts without additional locking. The sequence is created idempotently in the Strapi `bootstrap()` function via `CREATE SEQUENCE IF NOT EXISTS`. The `beforeCreate` lifecycle hook on SellableUnit calls `NEXTVAL('sku_seq')` and formats the result.

## Considered Options

- **`COUNT(*)` + 1**: vulnerable to race conditions and produces gaps on deletions.
- **`MAX(sku)` + parse + increment**: same race condition problem.
- **Counter table with `UPDATE ... RETURNING`**: portable but adds a table and transaction overhead for a problem PostgreSQL sequences solve natively.
