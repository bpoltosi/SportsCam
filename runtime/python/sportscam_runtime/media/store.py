from __future__ import annotations

import hashlib
import shutil
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import BinaryIO, Protocol

from .object_store import CompletedUpload, UploadPart


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
        self.root = Path(root)
        self.root.mkdir(parents=True, exist_ok=True)
        self.multipart_root = self.root / ".multipart"
        self.multipart_root.mkdir(parents=True, exist_ok=True)

    def _path(self, key: str) -> Path:
        normalized = key.replace("\\", "/")
        path = (self.root / normalized).resolve()
        root = self.root.resolve()
        if root not in path.parents and path != root:
            raise ValueError("object key escapes media root")
        if self.multipart_root.resolve() in path.parents:
            raise ValueError("object key cannot target multipart workspace")
        return path

    def _multipart_path(self, upload_id: str) -> Path:
        if not upload_id or "/" in upload_id or "\\" in upload_id:
            raise ValueError("invalid upload id")
        return self.multipart_root / upload_id

    @staticmethod
    def _sha256(path: Path) -> tuple[int, str]:
        digest = hashlib.sha256()
        size = 0
        with path.open("rb") as source:
            while chunk := source.read(1024 * 1024):
                digest.update(chunk)
                size += len(chunk)
        return size, digest.hexdigest()

    def put_file(self, key: str, source: str | Path, content_type: str) -> StoredObject:
        target = self._path(key)
        target.parent.mkdir(parents=True, exist_ok=True)
        digest = hashlib.sha256()
        size = 0
        with Path(source).open("rb") as src, target.open("wb") as dst:
            while chunk := src.read(1024 * 1024):
                digest.update(chunk)
                size += len(chunk)
                dst.write(chunk)
        return StoredObject(key, content_type, size, digest.hexdigest())

    def open(self, key: str) -> BinaryIO:
        return self._path(key).open("rb")

    def delete(self, key: str) -> None:
        self._path(key).unlink(missing_ok=True)

    def begin_multipart(self, key: str, content_type: str) -> str:
        upload_id = uuid.uuid4().hex
        workspace = self._multipart_path(upload_id)
        workspace.mkdir(parents=True)
        (workspace / "manifest").write_text(
            f"{key}\n{content_type}\n",
            encoding="utf-8",
        )
        return upload_id

    def upload_part(self, upload_id: str, part: UploadPart, source: str | Path) -> None:
        if part.number < 1:
            raise ValueError("part number must be positive")
        workspace = self._multipart_path(upload_id)
        if not workspace.exists():
            raise FileNotFoundError(upload_id)
        target = workspace / f"{part.number:08d}.part"
        shutil.copyfile(source, target)
        size, checksum = self._sha256(target)
        if size != part.byte_size or checksum.lower() != part.checksum.lower():
            target.unlink(missing_ok=True)
            raise ValueError("multipart part checksum mismatch")

    def complete_multipart(self, upload_id: str, parts: list[UploadPart]) -> CompletedUpload:
        workspace = self._multipart_path(upload_id)
        manifest = workspace / "manifest"
        if not manifest.exists():
            raise FileNotFoundError(upload_id)
        key, content_type = manifest.read_text(encoding="utf-8").splitlines()[:2]
        if not parts:
            raise ValueError("multipart upload requires at least one part")
        if [p.number for p in parts] != sorted(p.number for p in parts):
            raise ValueError("parts must be ordered")
        output = self._path(key)
        output.parent.mkdir(parents=True, exist_ok=True)
        with output.open("wb") as dst:
            for part in parts:
                source = workspace / f"{part.number:08d}.part"
                if not source.exists():
                    raise FileNotFoundError(f"missing part {part.number}")
                dst.write(source.read_bytes())
        size, checksum = self._sha256(output)
        shutil.rmtree(workspace, ignore_errors=True)
        return CompletedUpload(key, content_type, size, checksum)

    def abort_multipart(self, upload_id: str) -> None:
        shutil.rmtree(self._multipart_path(upload_id), ignore_errors=True)
