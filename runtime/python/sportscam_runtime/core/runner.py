import subprocess
from collections.abc import Sequence

class CommandError(RuntimeError): pass

def run_command(command:Sequence[str], timeout:float|None=None)->subprocess.CompletedProcess[str]:
    try:
        return subprocess.run(list(command),check=True,text=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=timeout)
    except (subprocess.CalledProcessError,subprocess.TimeoutExpired) as exc:
        raise CommandError(str(exc)) from exc
