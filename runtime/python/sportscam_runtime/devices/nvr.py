from __future__ import annotations

from ..core.device import Device
from ..core.models import DeviceInfo, DeviceKind, DeviceStatus
from .http_camera import HTTPDevice


class NVRDevice(Device):
    def __init__(self, device_id: str, base_url: str, model: str = "generic-nvr"):
        self.http = HTTPDevice(device_id, base_url, model)
        super().__init__(DeviceInfo(device_id, DeviceKind.NVR, model, base_url))

    def status(self) -> DeviceStatus:
        return self.http.status()

    def recording_url(self, camera_id: str) -> str:
        raise NotImplementedError(
            f"NVR recording URL resolution for camera {camera_id!r} is vendor-specific."
        )
