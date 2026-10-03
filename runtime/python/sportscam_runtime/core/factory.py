from __future__ import annotations
from collections.abc import Callable
from typing import Any

DeviceBuilder = Callable[[dict[str, Any]], Any]

class DeviceFactory:
    """Dependency-injection registry. The core does not import vendor drivers."""

    def __init__(self) -> None:
        self._builders: dict[str, DeviceBuilder] = {}

    def register(self, kind: str, builder: DeviceBuilder) -> None:
        if kind in self._builders:
            raise ValueError(f"Device kind already registered: {kind}")
        self._builders[kind] = builder

    def build(self, config: dict[str, Any]) -> Any:
        try:
            builder = self._builders[config["kind"]]
        except KeyError as exc:
            raise ValueError(f"Unsupported device kind: {config.get('kind')}") from exc
        return builder(config)

    def kinds(self) -> tuple[str, ...]:
        return tuple(sorted(self._builders))
