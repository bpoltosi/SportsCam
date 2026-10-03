# SportsCam Backend — Foundation

Status: implementation started
Version: 0.1
Date: 2026-10-03

## Objective

Establish the first executable backend around the deterministic SportsCam Engine.

## Initial structure

- `packages/engine`: pure deterministic domain logic.
- `apps/api`: HTTP API boundary.
- `tests`: deterministic engine tests.
- `catalog/`: versioned technical definitions (existing project area).
- `docs/`: architecture and contracts.

## Current API

### GET /health

Returns service and engine versions.

### POST /v1/engine/resolve

Accepts a ProjectDefinition and returns:

- structural validation result;
- resolved modules;
- dependencies;
- compatible hardware;
- applied rules;
- BOM;
- diagnostics.

## Architectural rules

1. API must not contain technical resolution logic.
2. Engine must not depend on Fastify, HTTP, database or UI.
3. Catalog/rules are data, not hard-coded application behavior.
4. Engine results must be deterministic.
5. No AI call is required.
6. Persistence will be introduced behind repositories after the domain contract stabilizes.

## Next implementation increments

1. Formal JSON Schemas for all domain contracts.
2. Load catalog/rules from versioned files.
3. Add repository abstraction and SQLite adapter.
4. Add project CRUD endpoints.
5. Add migrations.
6. Add API contract tests.
7. Add CI.
8. Add D1/Postgres-compatible persistence adapter without changing domain logic.
