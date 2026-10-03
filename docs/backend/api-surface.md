# SportsCam API surface

## Public
- GET /health
- POST /v1/auth/register
- POST /v1/auth/login

## Authenticated
### Technical projects
- GET/POST /v1/projects
- GET/PUT/DELETE /v1/projects/:id
- POST /v1/engine/resolve
- GET /v1/projects/:id/resolutions

### Commercial domain
- POST /v1/organizations
- POST/GET /v1/organizations/:orgId/members
- POST/GET /v1/organizations/:orgId/projects
- GET/POST /v1/business-projects/:projectId/configurations
- GET/POST /v1/business-projects/:projectId/contracts
- GET/POST /v1/business-projects/:projectId/installations
- GET/POST /v1/business-projects/:projectId/hardware
- GET /v1/organizations/:orgId/audit

The current API is an MVP contract. Before public release, authorization must derive the organization from the authenticated session and enforce resource ownership on every route.


## Lifecycle mutations

Business resources now expose explicit state transitions rather than arbitrary status replacement:

- PATCH /v1/business-projects/:projectId/status
- PATCH /v1/contracts/:contractId/status
- PATCH /v1/installations/:installationId/status

Transitions are validated by the domain state machine and mutation events are persisted in the organization audit log. Invalid transitions return a conflict response.
