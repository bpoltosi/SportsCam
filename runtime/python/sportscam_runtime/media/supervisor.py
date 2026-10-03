from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Callable

from .recorder import RecorderHandle, start_rtsp_recording

@dataclass
class RecorderSpec:
    camera_id: str
    url: str
    output_dir: str
    segment_seconds: int = 60
    transport: str = "tcp"

@dataclass
class RecorderState:
    spec: RecorderSpec
    handle: RecorderHandle | None = None
    failures: int = 0
    next_retry_at: float = 0.0

class RecorderSupervisor:
    """Keeps one recorder process per camera and applies bounded exponential backoff."""

    def __init__(
        self,
        specs: list[RecorderSpec],
        start: Callable[..., RecorderHandle] = start_rtsp_recording,
        clock: Callable[[], float] = time.monotonic,
        max_backoff: float = 60.0,
    ) -> None:
        self._states = {spec.camera_id: RecorderState(spec) for spec in specs}
        if len(self._states) != len(specs):
            raise ValueError("camera ids must be unique")
        self._start = start
        self._clock = clock
        self._max_backoff = max_backoff

    def states(self) -> tuple[RecorderState, ...]:
        return tuple(self._states[key] for key in sorted(self._states))

    def tick(self) -> None:
        now = self._clock()
        for state in self.states():
            if state.handle is not None and state.handle.running:
                continue
            if now < state.next_retry_at:
                continue
            try:
                state.handle = self._start(
                    state.spec.url,
                    state.spec.output_dir,
                    state.spec.camera_id,
                    state.spec.segment_seconds,
                    state.spec.transport,
                )
                state.failures = 0
                state.next_retry_at = 0.0
            except Exception:
                state.handle = None
                state.failures += 1
                delay = min(self._max_backoff, 2 ** min(state.failures - 1, 6))
                state.next_retry_at = now + delay

    def stop_all(self) -> None:
        for state in self._states.values():
            if state.handle is not None:
                state.handle.stop()
                state.handle = None
