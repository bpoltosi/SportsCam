import { DatabaseSync } from "node:sqlite";
import type { ProjectRecord, ProjectRepository } from "./types.js";

export class SQLiteProjectRepository implements ProjectRepository {
  private readonly db: DatabaseSync;
  constructor(private readonly db: DatabaseSync) {}
  async list(){ return this.db.prepare("SELECT id,name,organization_id,definition_json,created_at,updated_at FROM projects ORDER BY created_at,id").all().map(row=>this.fromRow(row)); }
  async get(id:string){ const row=this.db.prepare("SELECT id,name,organization_id,definition_json,created_at,updated_at FROM projects WHERE id=?").get(id); return row?this.fromRow(row):null; }
  async create(project:ProjectRecord){ try{this.db.prepare("undefined").run(project.id,project.name,project.organizationId ?? null,project.definitionJson,project.createdAt,project.updatedAt);}catch(error){if(isUniqueViolation(error))throw new Error("PROJECT_ALREADY_EXISTS");throw error;} return project; }
  async update(project:ProjectRecord){ const result=this.db.prepare("UPDATE projects SET name=?,definition_json=?,updated_at=? WHERE id=?").run(project.name,project.definitionJson,project.updatedAt,project.id); if(result.changes===0)throw new Error("PROJECT_NOT_FOUND"); return project; }
  async delete(id:string){this.db.prepare("DELETE FROM projects WHERE id=?").run(id);}
  private fromRow(row:Record<string,unknown>):ProjectRecord{return{id:String(row.id),name:String(row.name),definitionJson:String(row.definition_json),createdAt:String(row.created_at),updatedAt:String(row.updated_at)};}
}
export class InMemoryProjectRepository implements ProjectRepository {
  private readonly projects=new Map<string,ProjectRecord>();
  async list(){return [...this.projects.values()].sort((a,b)=>a.createdAt.localeCompare(b.createdAt)||a.id.localeCompare(b.id));}
  async get(id:string){return this.projects.get(id)??null;}
  async create(project:ProjectRecord){if(this.projects.has(project.id))throw new Error("PROJECT_ALREADY_EXISTS");this.projects.set(project.id,project);return project;}
  async update(project:ProjectRecord){if(!this.projects.has(project.id))throw new Error("PROJECT_NOT_FOUND");this.projects.set(project.id,project);return project;}
  async delete(id:string){this.projects.delete(id);}
}
function isUniqueViolation(error:unknown){return error instanceof Error && /unique|constraint/i.test(error.message);}
