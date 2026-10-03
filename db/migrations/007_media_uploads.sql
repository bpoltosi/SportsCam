CREATE TABLE IF NOT EXISTS media_uploads (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  device_id TEXT REFERENCES devices(id) ON DELETE SET NULL,
  object_key TEXT NOT NULL,
  content_type TEXT NOT NULL,
  expected_size INTEGER NOT NULL CHECK(expected_size >= 0),
  checksum TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('initiated','uploading','completed','aborted','expired')),
  part_size INTEGER NOT NULL DEFAULT 5242880 CHECK(part_size > 0),
  uploaded_bytes INTEGER NOT NULL DEFAULT 0 CHECK(uploaded_bytes >= 0),
  idempotency_key TEXT,
  created_at TEXT NOT NULL,
  expires_at TEXT,
  completed_at TEXT,
  updated_at TEXT NOT NULL,
  UNIQUE(organization_id,idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_media_uploads_device_status
  ON media_uploads(device_id,status,created_at);

CREATE INDEX IF NOT EXISTS idx_media_uploads_org_status
  ON media_uploads(organization_id,status,created_at);
