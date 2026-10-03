export interface ProjectRecord {
  id: string;
  name: string;
  organizationId?: string | null;
  definitionJson: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectRepository {
  list(): Promise<ProjectRecord[]>;
  get(id: string): Promise<ProjectRecord | null>;
  create(project: ProjectRecord): Promise<ProjectRecord>;
  update(project: ProjectRecord): Promise<ProjectRecord>;
  delete(id: string): Promise<void>;
}
