from __future__ import annotations

from ..core.device import Device
from ..core.models import DeviceInfo, DeviceKind, DeviceStatus
from .http_camera import HTTPDevice


class ONVIFCamera(Device):
    """Minimal ONVIF adapter.

    Discovery/control is intentionally isolated here. A production vendor adapter can
    replace the SOAP implementation without changing the rest of SportsCam.
    """

    def __init__(
        self,
        device_id: str,
        endpoint: str,
        model: str = "generic-onvif",
        username: str | None = None,
        password: str | None = None,
    ) -> None:
        self.endpoint = endpoint.rstrip("/")
        self.username = username
        self.password = password
        super().__init__(DeviceInfo(device_id, DeviceKind.ONVIF_CAMERA, model, self.endpoint))

    def status(self) -> DeviceStatus:
        try:
            from urllib.request import Request, urlopen
            request = Request(self.endpoint, method="GET")
            with urlopen(request, timeout=5) as response:
                return DeviceStatus(True, f"ONVIF endpoint reachable: HTTP {response.status}")
        except Exception as exc:
            return DeviceStatus(False, str(exc))

    def profiles(self) -> list[dict]:
        raise NotImplementedError(
            "ONVIF profile negotiation belongs in the vendor/device integration layer; "
            "use RTSPCamera once the stream URI has been resolved."
        )
