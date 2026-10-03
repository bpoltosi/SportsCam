from __future__ import annotations

import json
from urllib.request import Request, urlopen

from ..core.device import Device
from ..core.models import DeviceInfo, DeviceKind, DeviceStatus


class HTTPDevice(Device):
    """Generic HTTP/REST camera adapter for vendors exposing status/control endpoints."""

    def __init__(self, device_id: str, base_url: str, model: str = "generic-http", timeout: float = 5.0):
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        super().__init__(DeviceInfo(device_id, DeviceKind.HTTP_CAMERA, model, self.base_url))

    def request(self, path: str, method: str = "GET", payload: dict | None = None) -> bytes:
        body = None if payload is None else json.dumps(payload).encode()
        headers = {"Accept": "application/json"}
        if payload is not None:
            headers["Content-Type"] = "application/json"
        request = Request(f"{self.base_url}/{path.lstrip('/')}", data=body, method=method, headers=headers)
        with urlopen(request, timeout=self.timeout) as response:
            return response.read()

    def status(self) -> DeviceStatus:
        try:
            response = self.request("/status")
            return DeviceStatus(True, "HTTP camera reachable", {"response": response[:1024].decode(errors="replace")})
        except Exception as exc:
            return DeviceStatus(False, str(exc))
