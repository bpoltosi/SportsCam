from pathlib import Path

from sportscam_runtime.media.object_store import UploadPart
from sportscam_runtime.media.store import LocalMediaStore


def test_local_multipart_round_trip(tmp_path: Path):
    first = tmp_path / "a.bin"
    second = tmp_path / "b.bin"
    first.write_bytes(b"hello ")
    second.write_bytes(b"sportscam")
    store = LocalMediaStore(tmp_path / "objects")
    upload_id = store.begin_multipart("segments/camera-1/0001.ts", "video/mp2t")
    import hashlib
    part_a = UploadPart(1, 6, hashlib.sha256(b"hello ").hexdigest())
    part_b = UploadPart(2, 9, hashlib.sha256(b"sportscam").hexdigest())
    store.upload_part(upload_id, part_a, first)
    store.upload_part(upload_id, part_b, second)
    result = store.complete_multipart(upload_id, [part_a, part_b])
    assert result.byte_size == 15
    with store.open(result.key) as saved:
        assert saved.read() == b"hello sportscam"
