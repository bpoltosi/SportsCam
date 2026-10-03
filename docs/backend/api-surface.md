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
