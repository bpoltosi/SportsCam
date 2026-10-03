# SportsCam Media Pipeline

## Canonical path

```
Camera / NVR
  -> FFmpeg ingest
  -> segmented recording
  -> Recording + Segment metadata
  -> Event
  -> Clip Job
  -> FFmpeg clip
  -> MediaObject
  -> playback/download
```

## Recording
The hot path must not copy video frames through Python. FFmpeg reads RTSP directly and writes segments.

Default:
- stream copy;
- fixed segment duration;
- monotonically increasing sequence;
- explicit recording id;
- reset segment timestamps where required;
- checksum generated after segment finalization when practical.

## Segment metadata
Minimum:
- recordingId;
- sequence;
- startedAt;
- durationMs;
- localPath/objectKey;
- byteSize;
- checksum;
- codec/container metadata when known.

## Event to clip
An event references a recording and a timestamp. Clip creation resolves:

`start = max(recordingStart, eventTimestamp - preSeconds)`

`end = eventTimestamp + postSeconds`.

The clip job is idempotent by `eventId + preSeconds + postSeconds + sourceRevision`.

## Clip states
```
QUEUED -> PROCESSING -> READY
                   \-> FAILED
READY -> DELETED
```

## Stream copy
Stream copy is the default because it minimizes CPU and latency.

Transcoding is used only when:
- source/container is incompatible;
- requested output requires it;
- stream-copy operation fails and policy allows fallback.

## Integrity
A clip is not READY until:
- output exists;
- output size is > 0;
- FFmpeg exits successfully;
- metadata is persisted;
- checksum is available when configured.

## Retention
Source recordings and derived clips have separate retention policies. Deleting a source must not silently delete a still-retained clip.

## Failure handling
Failed jobs retain an error code/message and can be retried. Repeated deterministic failures should be moved to a dead-letter state rather than retrying forever.
