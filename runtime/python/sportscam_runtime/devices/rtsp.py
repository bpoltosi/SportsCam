from __future__ import annotations

from urllib.parse import quote

from ..core.device import Device
from ..core.models import DeviceInfo, DeviceKind, DeviceStatus
from ..core.runner import run_command


class RTSPCamera(Device):
    def __init__(
        self,
        device_id: str,
        url: str,
        model: str = "generic-rtsp",
        username: str | None = None,
        password: str | None = None,
    ) -> None:
        self.raw_url = url
        self.username = username
        self.password = password
        self.url = self._with_credentials(url)
        super().__init__(DeviceInfo(device_id, DeviceKind.RTSP_CAMERA, model, url))

    def _with_credentials(self, url: str) -> str:
        if not self.username or "://" not in url or "@" in url:
            return url
        scheme, rest = url.split("://", 1)
        user = quote(self.username, safe="")
        password = quote(self.password or "", safe="")
        return f"{scheme}://{user}:{password}@{rest}"

    def status(self) -> DeviceStatus:
        try:
            run_command(["ffprobe", "-v", "error", "-rtsp_transport", "tcp", "-show_entries",
                         "stream=index", "-of", "csv=p=0", self.url], timeout=8)
            return DeviceStatus(True, "RTSP stream reachable")
        except Exception as exc:
            return DeviceStatus(False, str(exc))
