from __future__ import annotations

from ..core.factory import DeviceFactory
from .gpio_device import GPIODevice
from .http_camera import HTTPDevice
from .nvr import NVRDevice
from .onvif import ONVIFCamera
from .rtsp import RTSPCamera
from .serial_device import SerialDevice
from .uvc import UVCCamera

def create_default_factory() -> DeviceFactory:
    factory = DeviceFactory()
    factory.register("rtsp_camera", lambda c: RTSPCamera(c["id"], c["url"], c.get("model", "generic"), c.get("username"), c.get("password")))
    factory.register("onvif_camera", lambda c: ONVIFCamera(c["id"], c["endpoint"], c.get("model", "generic"), c.get("username"), c.get("password")))
    factory.register("http_camera", lambda c: HTTPDevice(c["id"], c["base_url"], c.get("model", "generic-http")))
    factory.register("uvc_camera", lambda c: UVCCamera(c["id"], int(c.get("index", 0)), c.get("model", "generic-uvc")))
    factory.register("serial", lambda c: SerialDevice(c["id"], c["port"], int(c.get("baudrate", 115200)), c.get("model", "generic-serial")))
    factory.register("gpio", lambda c: GPIODevice(c["id"], int(c["pin"]), c.get("model", "generic-gpio")))
    factory.register("nvr", lambda c: NVRDevice(c["id"], c["base_url"], c.get("model", "generic-nvr")))
    return factory

def build_device(config: dict):
    return create_default_factory().build(config)
