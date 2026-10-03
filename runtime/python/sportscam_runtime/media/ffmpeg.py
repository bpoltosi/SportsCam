from pathlib import Path
import shutil
from ..core.models import ClipRequest,SegmentRequest
from ..core.runner import CommandError,run_command

def require_ffmpeg():
    if shutil.which("ffmpeg") is None: raise RuntimeError("FFmpeg is required")

def create_clip(request:ClipRequest)->Path:
    require_ffmpeg()
    output=Path(request.output); output.parent.mkdir(parents=True,exist_ok=True)
    cmd=["ffmpeg","-hide_banner","-loglevel","error","-y" if request.overwrite else "-n",
         "-ss",request.start,"-i",request.source,"-t",str(request.duration),
         "-map","0:v:0?","-map","0:a:0?"]
    if request.stream_copy: cmd += ["-c","copy"]
    else: cmd += ["-c:v","libx264","-preset","veryfast","-c:a","aac"]
    cmd.append(str(output))
    try: run_command(cmd)
    except CommandError as exc: raise RuntimeError(f"Failed to create clip: {exc}") from exc
    return output

def split_segments(request:SegmentRequest)->list[Path]:
    require_ffmpeg()
    directory=Path(request.output_dir); directory.mkdir(parents=True,exist_ok=True)
    pattern=directory/f"segment_%06d.{request.format}"
    cmd=["ffmpeg","-hide_banner","-loglevel","error","-y" if request.overwrite else "-n",
         "-i",request.source,"-map","0","-c","copy","-f","segment",
         "-segment_time",str(request.segment_seconds),"-reset_timestamps","1",str(pattern)]
    try: run_command(cmd)
    except CommandError as exc: raise RuntimeError(f"Failed to split recording: {exc}") from exc
    return sorted(directory.glob(f"segment_*.{request.format}"))
