from __future__ import annotations

import json
import subprocess
from pathlib import Path

from ..core.models import ClipRequest
from .ffmpeg import create_clip


def create_replay_clip(
    source: str,
    output: str,
    event_time: float,
    pre_seconds: float = 10,
    post_seconds: float = 10,
    stream_copy: bool = True,
    overwrite: bool = False,
) -> Path:
    """Create a replay clip centered on an event timestamp in seconds."""
    start = max(0.0, event_time - pre_seconds)
    duration = pre_seconds + post_seconds
    return create_clip(
        ClipRequest(
            source=source,
            output=output,
            start=str(start),
            duration=duration,
            stream_copy=stream_copy,
            overwrite=overwrite,
        )
    )


def write_clip_manifest(output: str, source: str, event_time: float, pre_seconds: float, post_seconds: float) -> Path:
    path = Path(output)
    path.parent.mkdir(parents=True, exist_ok=True)
    data = {
        "source": source,
        "event_time": event_time,
        "pre_seconds": pre_seconds,
        "post_seconds": post_seconds,
        "duration": pre_seconds + post_seconds,
    }
    path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
    return path
