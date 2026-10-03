from pathlib import Path

from sportscam_runtime.media.store import LocalMediaStore


def test_local_media_store_isolated_and_checksummed(tmp_path: Path):
    source = tmp_path / "source.bin"
    source.write_bytes(b"sportscam")
    store = LocalMediaStore(tmp_path / "objects")
    stored = store.put_file("clips/test.bin", source, "application/octet-stream")
    assert stored.byte_size == 9
    assert len(stored.checksum) == 64
    assert store.open("clips/test.bin").read() == b"sportscam"
