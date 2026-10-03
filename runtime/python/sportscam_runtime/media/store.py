from __future__ import annotations

import hashlib
from dataclasses import dataclass
from pathlib import Path
from typing import BinaryIO, Protocol


@dataclass(frozen=True)
class StoredObject:
    key: str
    content_type: str
    byte_size: int
    checksum: str


class MediaStore(Protocol):
    def put_file(self, key: str, source: str | Path, content_type: str) -> StoredObject: ...
    def open(self, key: str) -> BinaryIO: ...
    def delete(self, key: str) -> None: ...


class LocalMediaStore:
    """Filesystem implementation used by development and edge deployments."""

    def __init__(self, root: str | Path):
        self.root=Path(root)
        self.root.mkdir(parents=True,exist_ok=True)

    def _path(self, key: str) -> Path:
        normalized=key.replace("\\","/")
        path=(self.root / normalized).resolve()
        if self.root.resolve() not in path.parents and path != self.root.resolve():
            raise ValueError("object key escapes media root")
        return path

    def put_file(self, key: str, source: str | Path, content_type: str) -> StoredObject:
        target=self._path(key)
        target.parent.mkdir(parents=True,exist_ok=True)
        digest=hashlib.sha256()
        size=0
        with Path(source).open("rb") as src, target.open("wb") as dst:
            while chunk := src.read(1024 * 1024):
                digest.update(chunk)
                size += len(chunk)
                dst.write(chunk)
        return StoredObject(key,content_type,size,digest.hexdigest())

    def open(self, key: str) -> BinaryIO:
        return self._path(key).open("rb")

    def delete(self, key: str) -> None:
        self._path(key).unlink(missing_ok=True)
