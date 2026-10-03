# Backend production readiness

## Implemented

- deterministic SportsCam Engine with explicit dependency resolution, cycle detection, rule evaluation, compatibility filtering and deterministic diagnostics;
- runtime schemas and repository catalog validation;
- SQLite persistence with versioned migrations and shared database connection;
- organization/member/project/configuration/contract/installation/hardware/audit domain;
- immutable Engine resolution/configuration snapshots;
- domain state machines for project, contract and installation lifecycles;
- application services for audited business mutations;
- organization-scoped technical projects;
- bearer authentication with salted password hashing and expiring sessions;
- RBAC enforcement on the principal commercial routes;
- centralized API error normalization;
- graceful API shutdown;
- CI check command covering TypeScript, catalog integrity and tests.

## Remaining before public production

- external identity/email verification and password reset;
- durable distributed rate limiting and abuse protection;
- production secret/configuration management;
- structured audit writes for every remaining mutation route;
- observability, metrics, tracing and alerting;
- encrypted backups and a tested restore procedure;
- deployment manifests and environment separation;
- D1/Postgres adapter and migration compatibility testing;
- API contract/E2E tests against a real deployed service;
- billing/payment provider integration if commercial billing is enabled;
- formal security review and penetration testing.

The deterministic Engine remains independent from HTTP, persistence, authentication and commercial billing concerns.
