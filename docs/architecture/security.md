# SportsCam Security Baseline

## Tenant isolation
Every authenticated request resolves an organization from the session/token. Resource ownership is checked server-side; client-provided organization ids are never trusted.

## Authentication
- passwords are hashed using a memory-hard password hashing implementation;
- sessions/tokens are random and revocable;
- secrets never live in Git;
- production cookies/tokens require secure transport.

## Authorization
Roles are coarse-grained for MVP:
- owner;
- admin;
- manager;
- operator;
- viewer.

Authorization checks must occur at the application boundary and resource ownership must be verified before mutation/read.

## Device credentials
Device credentials are separate from human sessions. A device can only access its own commands and organization-scoped media.

## Data protection
- TLS in production;
- least privilege database credentials;
- object storage private by default;
- signed/authorized playback URLs;
- audit log for security-sensitive mutations.

## Abuse controls
Before public exposure:
- request body limits;
- rate limits on auth and edge registration;
- brute-force protection;
- upload size limits;
- timeout policies;
- structured security logs.

## Audit
Record actor, organization, action, resource type/id, timestamp and relevant metadata. Avoid passwords, raw tokens and secrets in audit metadata.

## Threat model
Primary threats:
- cross-tenant access;
- stolen device token;
- credential stuffing;
- malicious media upload;
- path traversal/local file abuse;
- replaying stale device commands;
- unbounded upload/storage abuse.

Mitigations must be covered by tests before production.
