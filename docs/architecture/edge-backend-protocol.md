# SportsCam Edge ↔ Backend Protocol

## Status
MVP protocol contract v0.1.

## Goals
- authenticate devices;
- register capabilities;
- maintain heartbeat;
- send recording/segment metadata;
- queue commands safely;
- resume uploads;
- remain usable during temporary outages.

## Identity
Every device has:
- `device_id` (stable UUID);
- `organization_id`;
- credential/token;
- `agent_version`;
- optional `hardware_profile`.

A device credential is scoped to one organization and must never grant access to another tenant.

## Heartbeat
`POST /v1/edge/devices/{deviceId}/heartbeat`

Payload follows `schemas/device-heartbeat.schema.json`.

Recommended cadence: 30s. Server considers a device stale after 90s and offline after 180s.

Heartbeat is idempotent by `deviceId + sentAt` bucket.

## Registration
`POST /v1/edge/devices/register`

Registration creates or rotates a device identity only when an enrollment credential is valid. The server returns device credentials and current desired configuration.

## Commands
Commands are pull-based initially:

`GET /v1/edge/devices/{deviceId}/commands?after={cursor}`

A command has:
- id;
- type;
- createdAt;
- payload;
- expiresAt.

Acknowledgement:

`POST /v1/edge/devices/{deviceId}/commands/{commandId}/ack`

Acknowledgement is idempotent.

## Upload
Media upload uses resumable object storage semantics. The API creates an upload session and returns an upload target. The edge stores the session locally and resumes after failure.

```
create upload
  -> upload parts
  -> complete
  -> server validates object
  -> MediaObject becomes available
```

A completed object is identified by a stable media object id and content checksum.

## Recording lifecycle

```
STARTING -> RECORDING -> STOPPING -> COMPLETE
                         \
                          -> FAILED
```

Segments may arrive out of order. The backend orders them by recording start timestamp/sequence, not arrival order.

## Retry policy

Transient network failures use exponential backoff with jitter:
1s, 2s, 4s, 8s, 16s, 30s, 60s max.

Permanent 4xx errors are not retried blindly.

## Offline behavior

The edge keeps:
- pending metadata;
- upload sessions;
- segment references;
- critical logs.

Local retention is bounded by a configured quota. When quota is reached, the runtime must stop accepting non-critical derived artifacts before deleting source recordings.

## Clock

Devices should synchronize via NTP. Every event/segment carries device timestamp and sequence. Backend stores receipt timestamp separately.

## Security

TLS is mandatory outside local development. Credentials are stored outside source control. Device tokens must be rotatable and revocable.

## Versioning

Protocol versions use `v1` URL namespace plus payload schema version where needed. Backward-compatible fields may be added; semantic changes require a new version.
