import json
from pathlib import Path
from .ffmpeg import create_clip
from ..core.models import ClipRequest

def create_replay_clip(source:str,output:str,event_time:float,pre_seconds:float=10,post_seconds:float=10,stream_copy:bool=True,overwrite:bool=False)->Path:
    start=max(0.0,event_time-pre_seconds)
    return create_clip(ClipRequest(source,output,str(start),pre_seconds+post_seconds,None,stream_copy,overwrite))

def write_clip_manifest(output:str,source:str,event_time:float,pre_seconds:float,post_seconds:float)->Path:
    path=Path(output); path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(json.dumps({"source":source,"event_time":event_time,"pre_seconds":pre_seconds,"post_seconds":post_seconds,"duration":pre_seconds+post_seconds},indent=2)+"\n",encoding="utf-8")
    return path
