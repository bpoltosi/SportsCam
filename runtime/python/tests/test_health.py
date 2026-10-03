from sportscam_runtime.core.device import Device
from sportscam_runtime.core.health import DeviceHealthMonitor
from sportscam_runtime.core.models import DeviceInfo, DeviceKind, DeviceStatus

class Fake(Device):
    def status(self): return DeviceStatus(True,"ok")

def test_health_monitor_reports_all_devices():
    devices=[Fake(DeviceInfo("a",DeviceKind.RTSP_CAMERA,"fake")),Fake(DeviceInfo("b",DeviceKind.NVR,"fake"))]
    result=DeviceHealthMonitor(devices,clock=lambda:123.0).check()
    assert [(x.device_id,x.online,x.checked_at) for x in result]==[("a",True,123.0),("b",True,123.0)]
