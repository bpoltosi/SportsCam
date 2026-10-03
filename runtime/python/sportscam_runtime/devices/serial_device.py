from __future__ import annotations

from ..core.device import Device
from ..core.models import DeviceInfo, DeviceKind, DeviceStatus


class SerialDevice(Device):
    def __init__(self, device_id: str, port: str, baudrate: int = 115200, model: str = "generic-serial"):
        self.port = port
        self.baudrate = baudrate
        self._serial = None
        super().__init__(DeviceInfo(device_id, DeviceKind.SERIAL, model, port))

    def _open(self):
        try:
            import serial
        except ImportError as exc:
            raise RuntimeError("Install sportscam-runtime[serial] to use serial devices") from exc
        if self._serial is None:
            self._serial = serial.Serial(self.port, self.baudrate, timeout=1)
        return self._serial

    def status(self) -> DeviceStatus:
        try:
            serial_port = self._open()
            return DeviceStatus(serial_port.is_open, "Serial port opened")
        except Exception as exc:
            return DeviceStatus(False, str(exc))

    def write(self, payload: bytes) -> None:
        self._open().write(payload)

    def close(self) -> None:
        if self._serial is not None:
            self._serial.close()
            self._serial = None
