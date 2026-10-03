from __future__ import annotations

import subprocess
from collections.abc import Sequence
from dataclasses import dataclass

class CommandError(RuntimeError):
    pass

@dataclass
class ProcessHandle:
    """Non-blocking handle for long-running external processes."""
    process: subprocess.Popen[str]

    def poll(self) -> int | None:
        return self.process.poll()

    def stop(self, timeout: float = 5.0) -> None:
        if self.process.poll() is not None:
            return
        self.process.terminate()
        try:
            self.process.wait(timeout=timeout)
        except subprocess.TimeoutExpired:
            self.process.kill()
            self.process.wait()

def run_command(command: Sequence[str], timeout: float | None = None) -> subprocess.CompletedProcess[str]:
    try:
        return subprocess.run(
            list(command), check=True, text=True,
            stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=timeout,
        )
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired) as exc:
        raise CommandError(str(exc)) from exc

def start_process(command: Sequence[str]) -> ProcessHandle:
    """Start a long-running process without buffering its output in memory."""
    try:
        process = subprocess.Popen(
            list(command),
            stdin=subprocess.DEVNULL,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            text=True,
        )
    except OSError as exc:
        raise CommandError(str(exc)) from exc
    return ProcessHandle(process)
