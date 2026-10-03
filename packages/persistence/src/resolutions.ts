import { DatabaseSync } from "node:sqlite";

export interface ResolutionRecord {
  id: string;
  projectId: string;
  engineVersion: string;
  createdAt: string;
  inputJson: string;
  resultJson: string;
}

export class SQLiteResolutionRepository {
  constructor(private readonly db: DatabaseSync) {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS resolutions (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        engine_version TEXT NOT NULL,
        created_at TEXT NOT NULL,
        input_json TEXT NOT NULL,
        result_json TEXT NOT NULL,
        FOREIGN KEY(project_id) REFERENCES projects(id)
      );
      CREATE INDEX IF NOT EXISTS idx_resolutions_project ON resolutions(project_id, created_at);
    `);
  }

  save(record: ResolutionRecord): void {
    this.db.prepare(
      "INSERT INTO resolutions (id, project_id, engine_version, created_at, input_json, result_json) VALUES (?, ?, ?, ?, ?, ?)",
    ).run(record.id, record.projectId, record.engineVersion, record.createdAt, record.inputJson, record.resultJson);
  }

  listByProject(projectId: string): ResolutionRecord[] {
    return this.db.prepare(
      "SELECT id, project_id, engine_version, created_at, input_json, result_json FROM resolutions WHERE project_id = ? ORDER BY created_at DESC",
    ).all().map(row => ({
      id: String(row.id),
      projectId: String(row.project_id),
      engineVersion: String(row.engine_version),
      createdAt: String(row.created_at),
      inputJson: String(row.input_json),
      resultJson: String(row.result_json),
    }));
  }
}
