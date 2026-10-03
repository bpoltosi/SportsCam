import sqlite3
from pathlib import Path

from sportscam_runtime.media.clip_worker import ClipWorker


def make_db(path: Path) -> None:
    db = sqlite3.connect(path)
    db.executescript("""
    CREATE TABLE processing_jobs (
      id TEXT PRIMARY KEY, organization_id TEXT, type TEXT, resource_id TEXT,
      status TEXT, attempts INTEGER, available_at TEXT, started_at TEXT,
      finished_at TEXT, error_code TEXT, error_message TEXT, created_at TEXT, updated_at TEXT
    );
    CREATE TABLE clips (
      id TEXT PRIMARY KEY, organization_id TEXT, project_id TEXT, event_id TEXT,
      status TEXT, pre_seconds REAL, post_seconds REAL, media_object_id TEXT,
      error_code TEXT, error_message TEXT, source_revision INTEGER,
      created_at TEXT, updated_at TEXT
    );
    """)
    db.execute(
        "INSERT INTO clips VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
        ("clip-1","org-1","project-1","event-1","queued",5,5,None,None,None,1,"2026-01-01T00:00:00Z","2026-01-01T00:00:00Z"),
    )
    db.execute(
        "INSERT INTO processing_jobs VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
        ("job-1","org-1","clip","clip-1","queued",0,"2020-01-01T00:00:00Z",None,None,None,None,"2026-01-01T00:00:00Z","2026-01-01T00:00:00Z"),
    )
    db.commit()
    db.close()


def test_claim_marks_clip_processing(tmp_path: Path):
    database = tmp_path / "jobs.db"
    make_db(database)
    worker = ClipWorker(str(database), str(tmp_path / "media"))
    job = worker.claim()
    assert job is not None
    assert job["id"] == "job-1"
    db = sqlite3.connect(database)
    assert db.execute("SELECT status FROM clips WHERE id='clip-1'").fetchone()[0] == "processing"
    assert db.execute("SELECT status,attempts FROM processing_jobs WHERE id='job-1'").fetchone() == ("running", 1)
    db.close()
