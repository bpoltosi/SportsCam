import json
from urllib.request import Request,urlopen
from ..core.device import Device
from ..core.models import DeviceInfo,DeviceKind,DeviceStatus

class HTTPDevice(Device):
    def __init__(self,device_id:str,base_url:str,model:str="generic-http",timeout:float=5):
        self.base_url=base_url.rstrip("/"); self.timeout=timeout
        super().__init__(DeviceInfo(device_id,DeviceKind.HTTP_CAMERA,model,self.base_url))
    def request(self,path:str,method:str="GET",payload:dict|None=None)->bytes:
        body=None if payload is None else json.dumps(payload).encode()
        headers={"Accept":"application/json"}
        if payload is not None: headers["Content-Type"]="application/json"
        req=Request(f"{self.base_url}/{path.lstrip('/')}",data=body,method=method,headers=headers)
        with urlopen(req,timeout=self.timeout) as response: return response.read()
    def status(self)->DeviceStatus:
        try:
            body=self.request("/status")
            return DeviceStatus(True,"HTTP endpoint reachable",{"response":body[:512].decode(errors="replace")})
        except Exception as exc: return DeviceStatus(False,str(exc))
