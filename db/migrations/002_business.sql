CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(organization_id,email),
  FOREIGN KEY(organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS business_projects (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  name TEXT NOT NULL,
  sport TEXT NOT NULL,
  status TEXT NOT NULL,
  current_configuration_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS project_configurations (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  version INTEGER NOT NULL,
  definition_json TEXT NOT NULL,
  engine_version TEXT,
  resolution_json TEXT,
  created_at TEXT NOT NULL,
  created_by TEXT NOT NULL,
  UNIQUE(project_id,version),
  FOREIGN KEY(project_id) REFERENCES business_projects(id) ON DELETE CASCADE,
  FOREIGN KEY(created_by) REFERENCES members(id)
);

CREATE TABLE IF NOT EXISTS contracts (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  number TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL,
  currency TEXT NOT NULL,
  total_cents INTEGER NOT NULL,
  valid_until TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(project_id) REFERENCES business_projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS installations (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  status TEXT NOT NULL,
  scheduled_at TEXT,
  completed_at TEXT,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(project_id) REFERENCES business_projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS installed_hardware (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  installation_id TEXT,
  catalog_hardware_id TEXT NOT NULL,
  serial_number TEXT,
  quantity INTEGER NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(project_id) REFERENCES business_projects(id) ON DELETE CASCADE,
  FOREIGN KEY(installation_id) REFERENCES installations(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  actor_member_id TEXT,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  metadata_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY(actor_member_id) REFERENCES members(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_members_org ON members(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_org ON business_projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_config_project ON project_configurations(project_id,version);
CREATE INDEX IF NOT EXISTS idx_contracts_project ON contracts(project_id,created_at);
CREATE INDEX IF NOT EXISTS idx_installations_project ON installations(project_id,created_at);
CREATE INDEX IF NOT EXISTS idx_hardware_project ON installed_hardware(project_id,created_at);
CREATE INDEX IF NOT EXISTS idx_audit_org ON audit_events(organization_id,created_at);
