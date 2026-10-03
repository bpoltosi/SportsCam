from __future__ import annotations

import shutil
from pathlib import Path

from ..core.models import ClipRequest, SegmentRequest
from ..core.runner import CommandError, run_command


def require_ffmpeg() -> None:
    if shutil.which("ffmpeg") is None:
        raise RuntimeError("FFmpeg is required for SportsCam video operations")


def create_clip(request: ClipRequest) -> Path:
    require_ffmpeg()
    output = Path(request.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    command = ["ffmpeg", "-hide_banner", "-loglevel", "error"]
    if request.overwrite:
        command.append("-y")
    else:
        command.append("-n")
    command += ["-ss", request.start, "-i", request.source, "-t", str(request.duration)]
    if request.stream_copy:
        command += ["-map", "0:v:0?", "-map", "0:a:0?", "-c", "copy"]
    else:
        command += ["-map", "0:v:0?", "-map", "0:a:0?", "-c:v", "libx264", "-preset", "veryfast", "-c:a", "aac"]
    command.append(str(output))
    try:
        run_command(command)
    except CommandError as exc:
        raise RuntimeError(f"Failed to create clip: {exc}") from exc
    return output


def split_segments(request: SegmentRequest) -> list[Path]:
    require_ffmpeg()
    output_dir = Path(request.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    pattern = output_dir / f"segment_%06d.{request.format}"
    command = ["ffmpeg", "-hide_banner", "-loglevel", "error"]
    command.append("-y" if request.overwrite else "-n")
    command += ["-i", request.source, "-map", "0", "-c", "copy",
                "-f", "segment", "-segment_time", str(request.segment_seconds), "-reset_timestamps", "1", str(pattern)]
    try:
        run_command(command)
    except CommandError as exc:
        raise RuntimeError(f"Failed to split recording: {exc}") from exc
    return sorted(output_dir.glob(f"segment_*.{request.format}"))
