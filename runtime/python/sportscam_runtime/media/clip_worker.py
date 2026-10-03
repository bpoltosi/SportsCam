from __future__ import annotations

import argparse
import sqlite3
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path

from .replay import create_replay_from_segments
from .store import LocalMediaStore


def iso_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def parse_iso(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


class ClipWorker:
    def __init__(self, database: str, media_root: str, max_attempts: int = 5):
        self.database = database
        self.media_root = Path(media_root)
        self.max_attempts = max_attempts
        self.media_root.mkdir(parents=True, exist_ok=True)
        self.store=LocalMediaStore(self.media_root)

    def _connect(self) -> sqlite3.Connection:
        db = sqlite3.connect(self.database, timeout=30, isolation_level=None)
        db.row_factory = sqlite3.Row
        db.execute("PRAGMA foreign_keys = ON")
        return db

    def claim(self) -> sqlite3.Row | None:
        db = self._connect()
        try:
            db.execute("BEGIN IMMEDIATE")
            now = iso_now()
            job = db.execute(
                "SELECT * FROM processing_jobs WHERE type='clip' AND status='queued' AND available_at<=? "
                "ORDER BY available_at,created_at LIMIT 1",
                (now,),
            ).fetchone()
            if not job:
                db.execute("COMMIT")
                return None
            db.execute(
                "UPDATE processing_jobs SET status='running',attempts=attempts+1,started_at=?,updated_at=? "
                "WHERE id=? AND status='queued'",
                (now, now, job["id"]),
            )
            db.execute("UPDATE clips SET status='processing',updated_at=? WHERE id=?", (now, job["resource_id"]))
            db.execute("COMMIT")
            return dict(job)
        except Exception:
            db.execute("ROLLBACK")
            raise
        finally:
            db.close()

    def process(self, job: sqlite3.Row | dict) -> None:
        job_id = str(job["id"])
        clip_id = str(job["resource_id"])
        db = self._connect()
        try:
            clip = db.execute("SELECT * FROM clips WHERE id=?", (clip_id,)).fetchone()
            if not clip:
                raise RuntimeError("CLIP_NOT_FOUND")
            event = db.execute("SELECT * FROM events WHERE id=?", (clip["event_id"],)).fetchone()
            if not event or not event["recording_id"]:
                raise RuntimeError("EVENT_RECORDING_NOT_FOUND")
            recording = db.execute("SELECT * FROM recordings WHERE id=?", (event["recording_id"],)).fetchone()
            if not recording:
                raise RuntimeError("RECORDING_NOT_FOUND")

            event_at = parse_iso(recording["started_at"]).timestamp() + (int(event["timestamp_ms"]) / 1000.0)
            clip_start = event_at - float(clip["pre_seconds"])
            clip_end = event_at + float(clip["post_seconds"])
            segments = db.execute(
                "SELECT * FROM recording_segments WHERE recording_id=? ORDER BY sequence",
                (recording["id"],),
            ).fetchall()
            selected = []
            for segment in segments:
                start = parse_iso(segment["started_at"]).timestamp()
                end = start + int(segment["duration_ms"]) / 1000.0
                if end >= clip_start and start <= clip_end and segment["local_path"]:
                    selected.append((segment, start, end))
            if not selected:
                raise RuntimeError("NO_SOURCE_SEGMENTS")
            first_start = selected[0][1]
            sources = [str(row["local_path"]) for row, _, _ in selected]
            output_key = f"clips/{recording['project_id'] or 'unassigned'}/{clip_id}.mkv"
            work_output = self.media_root / ".work" / f"{clip_id}.mkv"
            start_offset = max(0.0, clip_start - first_start)
            duration = max(0.1, clip_end - clip_start)
            create_replay_from_segments(sources, str(work_output), start_offset, duration, stream_copy=True, overwrite=True)
            stored = self.store.put_file(output_key, work_output, "video/x-matroska")
            work_output.unlink(missing_ok=True)

            now = iso_now()
            media_id = str(uuid.uuid4())
            db.execute(
                "INSERT INTO media_objects(id,organization_id,object_key,content_type,byte_size,checksum,status,created_at,updated_at) "
                "VALUES (?,?,?,?,?,?,?,?,?)",
                (media_id, clip["organization_id"], stored.key, stored.content_type, stored.byte_size, stored.checksum, "available", now, now),
            )
            db.execute(
                "UPDATE clips SET status='ready',media_object_id=?,error_code=NULL,error_message=NULL,updated_at=? WHERE id=?",
                (media_id, now, clip_id),
            )
            db.execute(
                "UPDATE processing_jobs SET status='succeeded',finished_at=?,updated_at=? WHERE id=?",
                (now, now, job_id),
            )
        except Exception as exc:
            now = iso_now()
            job_row = db.execute("SELECT attempts FROM processing_jobs WHERE id=?", (job_id,)).fetchone()
            attempts = int(job_row["attempts"]) if job_row else self.max_attempts
            terminal = attempts >= self.max_attempts
            delay = min(300, 2 ** max(0, attempts - 1))
            db.execute(
                "UPDATE clips SET status=?,error_code=?,error_message=?,updated_at=? WHERE id=?",
                ("failed" if terminal else "queued", "CLIP_PROCESSING_FAILED", str(exc)[:1000], now, clip_id),
            )
            db.execute(
                "UPDATE processing_jobs SET status=?,available_at=?,finished_at=?,error_code=?,error_message=?,updated_at=? WHERE id=?",
                ("dead_letter" if terminal else "queued", now if terminal else datetime.fromtimestamp(time.time()+delay, timezone.utc).isoformat().replace("+00:00","Z"), now if terminal else None, "CLIP_PROCESSING_FAILED", str(exc)[:1000], now, job_id),
            )
            if terminal:
                raise
        finally:
            db.close()

    def run_once(self) -> bool:
        job = self.claim()
        if not job:
            return False
        self.process(job)
        return True

    def run_forever(self, poll_seconds: float = 1.0) -> None:
        while True:
            if not self.run_once():
                time.sleep(poll_seconds)


def main() -> int:
    parser = argparse.ArgumentParser(description="SportsCam persistent clip worker")
    parser.add_argument("--database", default="sportscam.db")
    parser.add_argument("--media-root", default="media")
    parser.add_argument("--once", action="store_true")
    parser.add_argument("--poll", type=float, default=1.0)
    args = parser.parse_args()
    worker = ClipWorker(args.database, args.media_root)
    if args.once:
        worker.run_once()
    else:
        worker.run_forever(args.poll)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
