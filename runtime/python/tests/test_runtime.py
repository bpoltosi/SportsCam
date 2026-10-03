from pathlib import Path
from sportscam_runtime.core.models import ClipRequest
from sportscam_runtime.devices.registry import build_device

def test_registry_rtsp():
    d=build_device({"id":"cam-01","kind":"rtsp_camera","url":"rtsp://127.0.0.1/live"})
    assert d.info.id=="cam-01"
    assert d.info.kind.value=="rtsp_camera"

def test_clip_request(tmp_path:Path):
    request=ClipRequest("recording.mkv",str(tmp_path/"clip.mp4"),"10",15)
    assert request.duration==15
    assert request.stream_copy is True
