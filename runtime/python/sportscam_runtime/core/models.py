from dataclasses import dataclass, field
from enum import Enum
from typing import Any


class DeviceKind(str, Enum):
    RTSP_CAMERA = "rtsp_camera"
    ONVIF_CAMERA = "onvif_camera"
    HTTP_CAMERA = "http_camera"
    UVC_CAMERA = "uvc_camera"
    SERIAL = "serial"
    GPIO = "gpio"
    NVR = "nvr"


@dataclass(frozen=True)
class DeviceInfo:
    id: str
    kind: DeviceKind
    model: str
    address: str | None = None
    capabilities: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class DeviceStatus:
    online: bool
    message: str = ""
    details: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class ClipRequest:
    source: str
    output: str
    start: str
    duration: float
    camera_id: str | None = None
    stream_copy: bool = True
    overwrite: bool = False


@dataclass(frozen=True)
class SegmentRequest:
    source: str
    output_dir: str
    segment_seconds: int = 60
    format: str = "mkv"
    overwrite: bool = False
