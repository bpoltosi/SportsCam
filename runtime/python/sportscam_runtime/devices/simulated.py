from __future__ import annotations

from ..core.device import Device
from ..core.models import DeviceInfo, DeviceStatus


class SimulatedDevice(Device):
    def __init__(self, device_id: str, kind, model: str = "simulated"):
        super().__init__(DeviceInfo(device_id, kind, model, "simulated://"))

    def status(self) -> DeviceStatus:
        return DeviceStatus(True, "simulated device")
