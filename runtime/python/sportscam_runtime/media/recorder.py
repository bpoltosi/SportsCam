from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from ..core.runner import CommandError, ProcessHandle, start_process

@dataclass
class RecorderHandle:
    """Lifecycle handle for a single camera recorder."""
    camera_id: str
    output_dir: Path
    process: ProcessHandle

    @property
    def running(self) -> bool:
        return self.process.poll() is None

    def stop(self, timeout: float = 5.0) -> None:
        self.process.stop(timeout)

def build_rtsp_record_command(
    url: str,
    output_dir: str,
    camera_id: str,
    segment_seconds: int = 60,
    transport: str = "tcp",
) -> list[str]:
    if segment_seconds <= 0:
        raise ValueError("segment_seconds must be positive")
    if transport not in {"tcp", "udp"}:
        raise ValueError("transport must be tcp or udp")
    directory = Path(output_dir)
    directory.mkdir(parents=True, exist_ok=True)
    # Include camera id and timestamp; FFmpeg rotates files without Python I/O.
    pattern = str(directory / f"{camera_id}_%Y%m%d_%H%M%S.mkv")
    return [
        "ffmpeg", "-hide_banner", "-loglevel", "error",
        "-rtsp_transport", transport, "-i", url,
        "-map", "0", "-c", "copy",
        "-f", "segment", "-segment_time", str(segment_seconds),
        "-reset_timestamps", "1", "-strftime", "1", pattern,
    ]

def start_rtsp_recording(
    url: str,
    output_dir: str,
    camera_id: str,
    segment_seconds: int = 60,
    transport: str = "tcp",
) -> RecorderHandle:
    command = build_rtsp_record_command(url, output_dir, camera_id, segment_seconds, transport)
    try:
        process = start_process(command)
    except CommandError as exc:
        raise RuntimeError(f"Unable to start RTSP recorder: {exc}") from exc
    return RecorderHandle(camera_id, Path(output_dir), process)

def record_rtsp(*args, **kwargs) -> RecorderHandle:
    """Backward-compatible alias for starting a non-blocking recorder."""
    return start_rtsp_recording(*args, **kwargs)
