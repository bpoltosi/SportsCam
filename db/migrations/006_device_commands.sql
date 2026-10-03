CREATE TABLE IF NOT EXISTS device_commands (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  payload_json TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL CHECK(status IN ('queued','delivered','acknowledged','failed','expired')),
  created_at TEXT NOT NULL,
  delivered_at TEXT,
  acknowledged_at TEXT,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_device_commands_pull ON device_commands(device_id,status,created_at);
CREATE INDEX IF NOT EXISTS idx_device_commands_org ON device_commands(organization_id,status);
