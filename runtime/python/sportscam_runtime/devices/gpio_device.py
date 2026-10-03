from __future__ import annotations

from ..core.device import Device
from ..core.models import DeviceInfo, DeviceKind, DeviceStatus


class GPIODevice(Device):
    def __init__(self, device_id: str, pin: int, model: str = "generic-gpio"):
        self.pin = pin
        self._output = None
        super().__init__(DeviceInfo(device_id, DeviceKind.GPIO, f"GPIO {pin}", f"gpio://{pin}",
                                    {"model": model, "pin": pin}))

    def _open(self):
        try:
            from gpiozero import OutputDevice
        except ImportError as exc:
            raise RuntimeError("Install sportscam-runtime[gpio] to use GPIO devices") from exc
        if self._output is None:
            self._output = OutputDevice(self.pin, initial_value=False)
        return self._output

    def status(self) -> DeviceStatus:
        try:
            output = self._open()
            return DeviceStatus(True, "GPIO ready", {"value": output.value})
        except Exception as exc:
            return DeviceStatus(False, str(exc))

    def set(self, enabled: bool) -> None:
        output = self._open()
        output.on() if enabled else output.off()

    def close(self) -> None:
        if self._output is not None:
            self._output.close()
            self._output = None
