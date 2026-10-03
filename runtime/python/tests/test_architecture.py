from sportscam_runtime.core.factory import DeviceFactory
from sportscam_runtime.devices.registry import create_default_factory
from sportscam_runtime.media.recorder import build_rtsp_record_command

def test_factory_is_extensible_without_changing_core():
    factory=DeviceFactory()
    factory.register("fake",lambda config: config["id"])
    assert factory.build({"kind":"fake","id":"x"})=="x"

def test_default_factory_is_complete():
    assert create_default_factory().kinds()==(
        "gpio","http_camera","nvr","onvif_camera","rtsp_camera","serial","uvc_camera"
    )

def test_recorder_does_not_use_python_video_io():
    command=build_rtsp_record_command("rtsp://camera/live","/tmp/recordings","cam01",60)
    assert "-c" in command and "copy" in command
    assert "-f" in command and "segment" in command
    assert "segment_time" in command
