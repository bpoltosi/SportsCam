from __future__ import annotations
from pathlib import Path
from ..core.runner import CommandError,run_command

def record_rtsp(url:str,output_dir:str,camera_id:str,segment_seconds:int=60,transport:str="tcp")->None:
    """Record an RTSP stream into rotating MKV segments."""
    Path(output_dir).mkdir(parents=True,exist_ok=True)
    pattern=str(Path(output_dir)/f"{camera_id}_%Y%m%d_%H%M%S.mkv")
    cmd=["ffmpeg","-hide_banner","-loglevel","warning","-rtsp_transport",transport,"-i",url,
         "-map","0","-c","copy","-f","segment","-segment_time",str(segment_seconds),
         "-reset_timestamps","1","-strftime","1",pattern]
    try: run_command(cmd)
    except CommandError as exc: raise RuntimeError(f"RTSP recorder stopped: {exc}") from exc
