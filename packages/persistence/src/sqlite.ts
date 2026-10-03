import { DatabaseSync } from "node:sqlite";
import type { ProjectRecord, ProjectRepository } from "./types.js";

export class SQLiteProjectRepository implements ProjectRepository {
  private readonly db: DatabaseSync;

  constructor(filename = "sportscam.db") {
    this.db = new DatabaseSync(filename);
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        definition_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
  }

  async list(): Promise<ProjectRecord[]> {
    return this.db.prepare(
      "SELECT id, name, definition_json, created_at, updated_at FROM projects ORDER BY created_at",
    ).all().map(row => this.fromRow(row));
  }

  async get(id: string): Promise<ProjectRecord | null> {
    const row = this.db.prepare(
      "SELECT id, name, definition_json, created_at, updated_at FROM projects WHERE id = ?",
    ).get(id);
    return row ? this.fromRow(row) : null;
  }

  async create(project: ProjectRecord): Promise<ProjectRecord> {
    try {
      this.db.prepare(
        "INSERT INTO projects (id, name, definition_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
      ).run(project.id, project.name, project.definitionJson, project.createdAt, project.updatedAt);
    } catch {
      throw new Error("PROJECT_ALREADY_EXISTS");
    }
    return project;
  }

  async update(project: ProjectRecord): Promise<ProjectRecord> {
    const result = this.db.prepare(
      "UPDATE projects SET name = ?, definition_json = ?, updated_at = ? WHERE id = ?",
    ).run(project.name, project.definitionJson, project.updatedAt, project.id);
    if (result.changes === 0) throw new Error("PROJECT_NOT_FOUND");
    return project;
  }

  async delete(id: string): Promise<void> {
    this.db.prepare("DELETE FROM projects WHERE id = ?").run(id);
  }

  close(): void {
    this.db.close();
  }

  private fromRow(row: Record<string, unknown>): ProjectRecord {
    return {
      id: String(row.id),
      name: String(row.name),
      definitionJson: String(row.definition_json),
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at),
    };
  }
}

export class InMemoryProjectRepository implements ProjectRepository {
  private readonly projects = new Map<string, ProjectRecord>();
  async list(): Promise<ProjectRecord[]> { return [...this.projects.values()].sort((a,b) => a.createdAt.localeCompare(b.createdAt)); }
  async get(id: string): Promise<ProjectRecord | null> { return this.projects.get(id) ?? null; }
  async create(project: ProjectRecord): Promise<ProjectRecord> {
    if (this.projects.has(project.id)) throw new Error("PROJECT_ALREADY_EXISTS");
    this.projects.set(project.id, project); return project;
  }
  async update(project: ProjectRecord): Promise<ProjectRecord> {
    if (!this.projects.has(project.id)) throw new Error("PROJECT_NOT_FOUND");
    this.projects.set(project.id, project); return project;
  }
  async delete(id: string): Promise<void> { this.projects.delete(id); }
}
