from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from ..core.runner import CommandError, run_command
from ..media.ffmpeg import require_ffmpeg


@dataclass(frozen=True)
class SyntheticCameraSpec:
    camera_id: str
    output_dir: str
    duration_seconds: int = 30
    segment_seconds: int = 5
    width: int = 640
    height: int = 360
    fps: int = 30


def generate_segments(spec: SyntheticCameraSpec) -> list[Path]:
    """Generate deterministic local camera segments without physical hardware."""
    if spec.duration_seconds <= 0 or spec.segment_seconds <= 0:
        raise ValueError("durations must be positive")
    if spec.width <= 0 or spec.height <= 0 or spec.fps <= 0:
        raise ValueError("video dimensions and fps must be positive")
    require_ffmpeg()

    output = Path(spec.output_dir)
    output.mkdir(parents=True, exist_ok=True)
    pattern = output / f"{spec.camera_id}_%06d.mkv"
    command = [
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
        "-f", "lavfi",
        "-i", f"testsrc2=size={spec.width}x{spec.height}:rate={spec.fps}",
        "-t", str(spec.duration_seconds),
        "-an",
        "-c:v", "libx264",
        "-preset", "ultrafast",
        "-pix_fmt", "yuv420p",
        "-f", "segment",
        "-segment_time", str(spec.segment_seconds),
        "-reset_timestamps", "1",
        str(pattern),
    ]
    try:
        run_command(command)
    except CommandError as exc:
        raise RuntimeError(f"Failed to generate synthetic camera segments: {exc}") from exc
    return sorted(output.glob(f"{spec.camera_id}_*.mkv"))
