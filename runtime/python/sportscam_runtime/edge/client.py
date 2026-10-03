from __future__ import annotations

import json
import ssl
import urllib.error
import urllib.request
from dataclasses import dataclass
from pathlib import Path
from typing import Any


@dataclass(frozen=True)
class EdgeCredentials:
    device_id: str
    token: str

    @classmethod
    def load(cls, path: str | Path) -> "EdgeCredentials":
        data = json.loads(Path(path).read_text(encoding="utf-8"))
        return cls(str(data["device_id"]), str(data["token"]))

    def save(self, path: str | Path) -> None:
        target = Path(path)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(json.dumps({"device_id": self.device_id, "token": self.token}, indent=2) + "\n", encoding="utf-8")
        try:
            target.chmod(0o600)
        except OSError:
            pass


class EdgeClient:
    """Small stdlib-only client for the versioned edge control protocol."""

    def __init__(self, base_url: str, credentials: EdgeCredentials | None = None, timeout: float = 10.0, ca_file: str | None = None):
        self.base_url = base_url.rstrip("/")
        self.credentials = credentials
        self.timeout = timeout
        self.context = ssl.create_default_context(cafile=ca_file)

    def _request(self, method: str, path: str, body: dict[str, Any] | None = None, authenticated: bool = True) -> dict[str, Any] | list[Any]:
        payload = None if body is None else json.dumps(body, separators=(",", ":")).encode()
        headers = {"Accept": "application/json"}
        if body is not None:
            headers["Content-Type"] = "application/json"
        if authenticated and self.credentials:
            headers["Authorization"] = f"Bearer {self.credentials.token}"
        request = urllib.request.Request(self.base_url + path, data=payload, headers=headers, method=method)
        try:
            with urllib.request.urlopen(request, timeout=self.timeout, context=self.context) as response:
                raw = response.read().decode("utf-8")
                return json.loads(raw) if raw else {}
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")
            raise RuntimeError(f"SportsCam API {exc.code}: {detail[:500]}") from exc

    def register(self, user_token: str, device_id: str, name: str, agent_version: str, hardware_profile: str | None = None) -> EdgeCredentials:
        previous = self.credentials
        self.credentials = EdgeCredentials(device_id, user_token)
        try:
            response = self._request("POST", "/v1/edge/devices/register", {"id": device_id, "name": name, "agentVersion": agent_version, "hardwareProfile": hardware_profile})
            if not isinstance(response, dict) or "token" not in response:
                raise RuntimeError("device registration response did not contain credentials")
            self.credentials = EdgeCredentials(str(response["id"]), str(response["token"]))
            return self.credentials
        except Exception:
            self.credentials = previous
            raise

    def heartbeat(self, status: str, agent_version: str, metrics: dict[str, Any] | None = None, camera_states: list[dict[str, Any]] | None = None) -> dict[str, Any] | list[Any]:
        if not self.credentials:
            raise RuntimeError("edge credentials are required")
        return self._request("POST", f"/v1/edge/devices/{self.credentials.device_id}/heartbeat", {
            "deviceId": self.credentials.device_id,
            "sentAt": __import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat(),
            "status": status,
            "agentVersion": agent_version,
            "metrics": metrics or {},
            "cameraStates": camera_states or [],
        })

    def pull_commands(self, limit: int = 20) -> dict[str, Any] | list[Any]:
        if not self.credentials:
            raise RuntimeError("edge credentials are required")
        return self._request("GET", f"/v1/edge/devices/{self.credentials.device_id}/commands?limit={max(1, min(100, int(limit)))}")

    def acknowledge(self, command_id: str, success: bool, error_message: str | None = None) -> dict[str, Any] | list[Any]:
        if not self.credentials:
            raise RuntimeError("edge credentials are required")
        return self._request("POST", f"/v1/edge/devices/{self.credentials.device_id}/commands/{command_id}/ack", {
            "success": success, "errorMessage": error_message
        })
