import type { ProjectRecord, ProjectRepository } from "./types.js";

export class InMemoryProjectRepository implements ProjectRepository {
  private readonly projects = new Map<string, ProjectRecord>();

  async list(): Promise<ProjectRecord[]> {
    return [...this.projects.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  async get(id: string): Promise<ProjectRecord | null> {
    return this.projects.get(id) ?? null;
  }

  async create(project: ProjectRecord): Promise<ProjectRecord> {
    if (this.projects.has(project.id)) {
      throw new Error("PROJECT_ALREADY_EXISTS");
    }
    this.projects.set(project.id, project);
    return project;
  }

  async update(project: ProjectRecord): Promise<ProjectRecord> {
    if (!this.projects.has(project.id)) {
      throw new Error("PROJECT_NOT_FOUND");
    }
    this.projects.set(project.id, project);
    return project;
  }

  async delete(id: string): Promise<void> {
    this.projects.delete(id);
  }
}
