from abc import ABC, abstractmethod
from typing import Any
from .models import DeviceInfo, DeviceStatus

class Device(ABC):
    def __init__(self, info: DeviceInfo):
        self.info = info

    @abstractmethod
    def status(self) -> DeviceStatus:
        raise NotImplementedError

    def capabilities(self) -> dict[str, Any]:
        return dict(self.info.capabilities)

    def close(self) -> None:
        pass
