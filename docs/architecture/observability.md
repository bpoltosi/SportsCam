# SportsCam Observability

## Device metrics
- heartbeat age;
- CPU;
- memory;
- disk free;
- temperature when available;
- camera state;
- FPS;
- dropped frames;
- bitrate;
- upload queue depth;
- upload failures;
- active recording count.

## Backend metrics
- request count/latency/error rate;
- authentication failures;
- active sessions;
- queue depth;
- processing duration;
- clip success/failure;
- storage operations;
- database latency.

## Logs
Use structured JSON logs with:
- timestamp;
- severity;
- service;
- requestId/correlationId;
- organizationId where safe;
- deviceId where safe;
- operation;
- error code.

Never log passwords, access tokens or signed URLs.

## Health
- liveness: process is running;
- readiness: dependencies required for serving are available;
- device health: heartbeat and camera health;
- job health: queue age and failure rate.

## Alert thresholds
Initial operational defaults:
- device stale > 90s: warning;
- device offline > 180s: critical;
- disk free < 15%: warning;
- disk free < 5%: critical;
- repeated FFmpeg crash: critical;
- upload queue older than configured SLA: warning.

Thresholds are configuration, not business logic.
