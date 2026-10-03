from pathlib import Path

from sportscam_runtime.sim.camera import SyntheticCameraSpec, generate_segments


def test_synthetic_camera_uses_deterministic_segment_layout(monkeypatch, tmp_path: Path):
    commands = []

    def fake_ffmpeg(command):
        commands.append(command)
        output = tmp_path / "cam-1"
        output.mkdir()
        (output / "cam-1_000000.mkv").write_bytes(b"segment")

    monkeypatch.setattr("sportscam_runtime.sim.camera.require_ffmpeg", lambda: None)
    monkeypatch.setattr("sportscam_runtime.sim.camera.run_command", fake_ffmpeg)

    result = generate_segments(
        SyntheticCameraSpec(
            camera_id="cam-1",
            output_dir=str(tmp_path / "cam-1"),
            duration_seconds=10,
            segment_seconds=5,
        )
    )

    assert result == [tmp_path / "cam-1" / "cam-1_000000.mkv"]
    assert commands
    assert "testsrc2=size=640x360:rate=30" in commands[0]
    assert "-segment_time" in commands[0]
    assert commands[0][-1].endswith("cam-1_%06d.mkv")
