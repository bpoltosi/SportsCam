from ..core.device import Device
from ..core.models import DeviceInfo,DeviceKind,DeviceStatus

class ONVIFCamera(Device):
    """ONVIF endpoint adapter; stream URLs are handed to RTSPCamera."""
    def __init__(self,device_id:str,endpoint:str,model:str="generic-onvif",username:str|None=None,password:str|None=None):
        self.endpoint=endpoint.rstrip("/"); self.username=username; self.password=password
        super().__init__(DeviceInfo(device_id,DeviceKind.ONVIF_CAMERA,model,self.endpoint))
    def status(self)->DeviceStatus:
        try:
            from urllib.request import Request,urlopen
            with urlopen(Request(self.endpoint,method="GET"),timeout=5) as response:
                return DeviceStatus(True,f"ONVIF endpoint reachable: HTTP {response.status}")
        except Exception as exc: return DeviceStatus(False,str(exc))
    def profiles(self)->list[dict]:
        raise NotImplementedError("Vendor ONVIF SOAP profile discovery must be implemented by the device integration.")
