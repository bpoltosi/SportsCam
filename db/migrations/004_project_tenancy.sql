ALTER TABLE projects ADD COLUMN organization_id TEXT REFERENCES organizations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_projects_organization ON projects(organization_id, created_at);
