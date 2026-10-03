from .gpio_device import GPIODevice
from .http_camera import HTTPDevice
from .nvr import NVRDevice
from .onvif import ONVIFCamera
from .rtsp import RTSPCamera
from .serial_device import SerialDevice
from .uvc import UVCCamera

def build_device(config:dict):
    kind=config["kind"]; common={"device_id":config["id"],"model":config.get("model","generic")}
    if kind=="rtsp_camera": return RTSPCamera(**common,url=config["url"],username=config.get("username"),password=config.get("password"))
    if kind=="onvif_camera": return ONVIFCamera(**common,endpoint=config["endpoint"],username=config.get("username"),password=config.get("password"))
    if kind=="http_camera": return HTTPDevice(**common,base_url=config["base_url"])
    if kind=="uvc_camera": return UVCCamera(**common,index=int(config.get("index",0)))
    if kind=="serial": return SerialDevice(**common,port=config["port"],baudrate=int(config.get("baudrate",115200)))
    if kind=="gpio": return GPIODevice(**common,pin=int(config["pin"]))
    if kind=="nvr": return NVRDevice(**common,base_url=config["base_url"])
    raise ValueError(f"Unsupported device kind: {kind}")
