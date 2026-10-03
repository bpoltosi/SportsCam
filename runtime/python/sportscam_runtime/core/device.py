from abc import ABC, abstractmethod

from .models import DeviceInfo, DeviceStatus


class Device(ABC):
    """Common contract implemented by every physical adapter."""

    def __init__(self, info: DeviceInfo) -> None:
        self.info = info

    @abstractmethod
    def status(self) -> DeviceStatus:
        raise NotImplementedError

    def close(self) -> None:
        """Release device resources. Safe to call more than once."""
