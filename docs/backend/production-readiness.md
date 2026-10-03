# Backend production readiness

## Implemented
- deterministic Engine and catalog;
- SQLite persistence and versioned migration runner;
- business domain: organizations, members, projects, configurations, contracts, installations and installed hardware;
- immutable Engine resolution/configuration snapshots;
- audit-event persistence;
- local authentication with password hashing and bearer sessions;
- CRUD/API foundations.

## Remaining before public production
- external identity/email verification and password reset;
- authorization enforcement by organization/resource on every route;
- rate limiting and abuse protection;
- CSRF strategy if cookie authentication is introduced;
- secrets/configuration management;
- structured audit writes on every mutation;
- observability, metrics, tracing and alerting;
- encrypted backups and tested restore procedure;
- deployment manifests and environment separation;
- D1/Postgres adapter and migration compatibility testing;
- E2E/API contract tests;
- billing/payment provider integration if commercial billing is enabled.

The architecture intentionally keeps these concerns outside the deterministic Engine.
