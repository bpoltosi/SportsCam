CREATE TABLE IF NOT EXISTS devices (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('online','degraded','offline','disabled')),
  agent_version TEXT NOT NULL,
  hardware_profile TEXT,
  credential_hash TEXT,
  last_heartbeat_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_devices_org_status ON devices(organization_id,status);

CREATE TABLE IF NOT EXISTS cameras (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  device_id TEXT REFERENCES devices(id) ON DELETE SET NULL,
  project_id TEXT REFERENCES business_projects(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  catalog_hardware_id TEXT,
  status TEXT NOT NULL CHECK(status IN ('online','degraded','offline','disabled')),
  configuration_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cameras_org_project ON cameras(organization_id,project_id);

CREATE TABLE IF NOT EXISTS recordings (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES business_projects(id) ON DELETE SET NULL,
  camera_id TEXT REFERENCES cameras(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK(status IN ('starting','recording','stopping','complete','failed')),
  started_at TEXT NOT NULL,
  ended_at TEXT,
  source_revision INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_recordings_project_time ON recordings(project_id,started_at);

CREATE TABLE IF NOT EXISTS recording_segments (
  id TEXT PRIMARY KEY,
  recording_id TEXT NOT NULL REFERENCES recordings(id) ON DELETE CASCADE,
  sequence INTEGER NOT NULL,
  started_at TEXT NOT NULL,
  duration_ms INTEGER NOT NULL,
  local_path TEXT,
  object_key TEXT,
  byte_size INTEGER,
  checksum TEXT,
  created_at TEXT NOT NULL,
  UNIQUE(recording_id,sequence)
);

CREATE INDEX IF NOT EXISTS idx_segments_recording ON recording_segments(recording_id,sequence);

CREATE TABLE IF NOT EXISTS media_objects (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  object_key TEXT NOT NULL UNIQUE,
  content_type TEXT NOT NULL,
  byte_size INTEGER,
  checksum TEXT,
  status TEXT NOT NULL CHECK(status IN ('pending','available','deleted')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES business_projects(id) ON DELETE SET NULL,
  recording_id TEXT REFERENCES recordings(id) ON DELETE SET NULL,
  timestamp_ms INTEGER NOT NULL,
  type TEXT NOT NULL,
  source TEXT NOT NULL CHECK(source IN ('manual','sensor','integration','algorithm','ai')),
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_events_recording_time ON events(recording_id,timestamp_ms);

CREATE TABLE IF NOT EXISTS clips (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES business_projects(id) ON DELETE SET NULL,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK(status IN ('queued','processing','ready','failed','deleted')),
  pre_seconds REAL NOT NULL,
  post_seconds REAL NOT NULL,
  media_object_id TEXT REFERENCES media_objects(id) ON DELETE SET NULL,
  error_code TEXT,
  error_message TEXT,
  source_revision INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(event_id,pre_seconds,post_seconds,source_revision)
);

CREATE INDEX IF NOT EXISTS idx_clips_project_status ON clips(project_id,status);

CREATE TABLE IF NOT EXISTS processing_jobs (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('queued','running','succeeded','failed','dead_letter')),
  attempts INTEGER NOT NULL DEFAULT 0,
  available_at TEXT NOT NULL,
  started_at TEXT,
  finished_at TEXT,
  error_code TEXT,
  error_message TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_jobs_ready ON processing_jobs(status,available_at);
