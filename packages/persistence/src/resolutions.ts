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
  constructor(private readonly db: DatabaseSync) {}

  save(record: ResolutionRecord): void {
    this.db.prepare(
      "INSERT INTO resolutions (id, project_id, engine_version, created_at, input_json, result_json) VALUES (?, ?, ?, ?, ?, ?)",
    ).run(record.id, record.projectId, record.engineVersion, record.createdAt, record.inputJson, record.resultJson);
  }

  listByProject(projectId: string): ResolutionRecord[] {
    return this.db.prepare(
      "SELECT id, project_id, engine_version, created_at, input_json, result_json FROM resolutions WHERE project_id = ? ORDER BY created_at DESC",
    ).all(projectId).map(row => ({
      id: String(row.id),
      projectId: String(row.project_id),
      engineVersion: String(row.engine_version),
      createdAt: String(row.created_at),
      inputJson: String(row.input_json),
      resultJson: String(row.result_json),
    }));
  }
}
