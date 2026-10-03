# SportsCam Backend — Current Foundation

## Implemented

- deterministic Engine;
- versioned module/rule/hardware catalogs;
- ProjectDefinition validation;
- Project CRUD foundation;
- repository abstraction;
- in-memory adapter;
- SQLite project adapter using Node's built-in SQLite API;
- immutable resolution snapshots;
- initial migration;
- API health and engine resolution endpoints;
- API project endpoints;
- JSON Schemas;
- automated build/test workflow.

## Persistence model

`projects` stores the canonical project definition as JSON.

`resolutions` stores immutable Engine outputs linked to the project.

## Boundary

The Engine remains pure and database-independent. Persistence adapters live outside it.

## Production hardening

Authentication, authorization, rate limiting, audit log, secrets management, observability, backup/restore and deployment configuration remain before public production.
