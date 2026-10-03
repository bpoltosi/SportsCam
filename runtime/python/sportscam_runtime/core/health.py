from __future__ import annotations

from dataclasses import dataclass
from time import monotonic
from typing import Iterable

from .device import Device
from .models import DeviceStatus

@dataclass(frozen=True)
class DeviceHealth:
    device_id: str
    online: bool
    message: str
    checked_at: float

class DeviceHealthMonitor:
    def __init__(self, devices: Iterable[Device], clock=monotonic):
        self.devices=list(devices)
        self.clock=clock

    def check(self)->list[DeviceHealth]:
        checked=self.clock()
        result=[]
        for device in self.devices:
            try:
                status=device.status()
            except Exception as exc:
                status=DeviceStatus(False,str(exc))
            result.append(DeviceHealth(device.info.id,status.online,status.message,checked))
        return result
