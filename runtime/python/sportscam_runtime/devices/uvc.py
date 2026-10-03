from ..core.device import Device
from ..core.models import DeviceInfo,DeviceKind,DeviceStatus

class UVCCamera(Device):
    def __init__(self,device_id:str,index:int=0,model:str="generic-uvc"):
        self.index=index; self._capture=None
        super().__init__(DeviceInfo(device_id,DeviceKind.UVC_CAMERA,model,f"/dev/video{index}"))
    def _open(self):
        try: import cv2
        except ImportError as exc: raise RuntimeError("Install sportscam-runtime[uvc]") from exc
        if self._capture is None: self._capture=cv2.VideoCapture(self.index)
        return self._capture
    def status(self)->DeviceStatus:
        try: return DeviceStatus(bool(self._open().isOpened()),"UVC camera opened")
        except Exception as exc: return DeviceStatus(False,str(exc))
    def read(self):
        ok,frame=self._open().read()
        if not ok: raise RuntimeError("Unable to read UVC frame")
        return frame
    def close(self):
        if self._capture is not None: self._capture.release(); self._capture=None
