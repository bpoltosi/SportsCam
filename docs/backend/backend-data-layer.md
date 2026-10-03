# SportsCam Backend — Data Layer

Status: implementation started
Version: 0.1

## Goal

Introduce persistence without coupling the Engine to a database.

## Contract

The domain depends on `ProjectRepository`, not SQLite/D1/Postgres directly.

```
API
  ↓
Application services
  ↓
ProjectRepository
  ↓
SQLite adapter (local)
  ↓
future D1/Postgres adapter
```

The initial repository contract supports list/get/create/update/delete. The current implementation is an in-memory adapter used to keep the API executable before selecting the SQLite driver and migration strategy.

## Persistence invariants

- project IDs are unique;
- project definitions are stored as JSON;
- timestamps use ISO 8601;
- database adapters must preserve the same repository contract;
- Engine output is not persisted as mutable state; resolutions should be stored as immutable snapshots in the next increment.
