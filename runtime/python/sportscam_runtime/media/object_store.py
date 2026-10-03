from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import BinaryIO, Protocol


@dataclass(frozen=True)
class UploadPart:
    number: int
    byte_size: int
    checksum: str


@dataclass(frozen=True)
class CompletedUpload:
    key: str
    content_type: str
    byte_size: int
    checksum: str


class ObjectStore(Protocol):
    """Provider-neutral storage boundary.

    Network/provider implementations belong outside the runtime core. This
    contract keeps multipart/resumable behavior independent from S3-compatible
    vendors, cloud SDKs, or local storage.
    """

    def put_file(self, key: str, source: str | Path, content_type: str) -> CompletedUpload: ...

    def open(self, key: str) -> BinaryIO: ...

    def delete(self, key: str) -> None: ...

    def begin_multipart(self, key: str, content_type: str) -> str: ...

    def upload_part(self, upload_id: str, part: UploadPart, source: str | Path) -> None: ...

    def complete_multipart(
        self,
        upload_id: str,
        parts: list[UploadPart],
    ) -> CompletedUpload: ...

    def abort_multipart(self, upload_id: str) -> None: ...
