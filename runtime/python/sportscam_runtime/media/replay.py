import json
import subprocess
from pathlib import Path
from .ffmpeg import create_clip
from ..core.models import ClipRequest

def create_replay_clip(source:str,output:str,event_time:float,pre_seconds:float=10,post_seconds:float=10,stream_copy:bool=True,overwrite:bool=False)->Path:
    start=max(0.0,event_time-pre_seconds)
    return create_clip(ClipRequest(source,output,str(start),pre_seconds+post_seconds,None,stream_copy,overwrite))

def create_replay_from_segments(sources:list[str], output:str, start_offset:float, duration:float, stream_copy:bool=True, overwrite:bool=False)->Path:
    if not sources:
        raise ValueError("at least one source segment is required")
    if start_offset < 0 or duration <= 0:
        raise ValueError("invalid clip window")
    target=Path(output)
    target.parent.mkdir(parents=True,exist_ok=True)
    concat=target.with_suffix(target.suffix+".concat.txt")
    try:
        concat.write_text("\n".join(f"file '{Path(source).resolve().as_posix().replace(chr(39), chr(39)+chr(92)+chr(39)+chr(39))}'" for source in sources)+"\n",encoding="utf-8")
        command=["ffmpeg","-hide_banner","-loglevel","error","-y" if overwrite else "-n","-f","concat","-safe","0","-i",str(concat),"-ss",str(start_offset),"-t",str(duration),"-c","copy",str(target)]
        subprocess.run(command,check=True)
        return target
    finally:
        concat.unlink(missing_ok=True)

def write_clip_manifest(output:str,source:str,event_time:float,pre_seconds:float,post_seconds:float)->Path:
    path=Path(output); path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(json.dumps({"source":source,"event_time":event_time,"pre_seconds":pre_seconds,"post_seconds":post_seconds,"duration":pre_seconds+post_seconds},indent=2)+"\n",encoding="utf-8")
    return path
