from abc import ABC, abstractmethod
from .models import DeviceInfo, DeviceStatus

class Device(ABC):
    def __init__(self, info: DeviceInfo): self.info=info
    @abstractmethod
    def status(self)->DeviceStatus: raise NotImplementedError
    def close(self)->None: pass
