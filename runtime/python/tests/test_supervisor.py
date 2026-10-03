from pathlib import Path

from sportscam_runtime.media.supervisor import RecorderSpec, RecorderSupervisor

class FakeHandle:
    running = True
    def stop(self): self.running = False

def test_supervisor_restarts_failed_recorder_with_backoff():
    clock_value = [0.0]
    calls = []
    attempts = [RuntimeError("down"), FakeHandle()]

    def start(*args):
        calls.append(args)
        result = attempts.pop(0)
        if isinstance(result, Exception):
            raise result
        return result

    supervisor = RecorderSupervisor(
        [RecorderSpec("cam-1","rtsp://camera","/tmp/cam")],
        start=start,
        clock=lambda: clock_value[0],
    )
    supervisor.tick()
    assert len(calls) == 1
    assert supervisor.states()[0].failures == 1

    supervisor.tick()
    assert len(calls) == 1

    clock_value[0] = 1.0
    supervisor.tick()
    assert len(calls) == 2
    assert supervisor.states()[0].failures == 0
