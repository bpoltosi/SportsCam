# ADR 0002 — FFmpeg owns the video hot path

- Status: accepted
- Date: 2026-10-03

## Decision
FFmpeg receives network camera streams directly and performs ingest, muxing and segmentation. Python orchestrates processes and handles device integration; it does not copy every video frame through Python during normal recording.

Clips use stream copy by default and transcoding only when compatibility/output requirements demand it.

## Rationale
This minimizes CPU and memory overhead, reduces latency and avoids coupling the runtime to a frame-processing library.

## Consequences
Frame-level computer vision, if introduced later, must be an explicit side pipeline rather than a hidden requirement of recording.
