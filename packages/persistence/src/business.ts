import { DatabaseSync } from "node:sqlite";
import type { AuditEvent, BusinessProject, Contract, Installation, InstalledHardware, Member, Organization, ProjectConfiguration } from "../../domain/src/business.js";
import { transitionContract, transitionInstallation, transitionProject } from "../../domain/src/transitions.js";

export class BusinessRepository {
  constructor(private readonly db: DatabaseSync) {}

  transaction<T>(work: () => T): T {
    this.db.exec("BEGIN");
    try { const result = work(); this.db.exec("COMMIT"); return result; }
    catch (error) { try { this.db.exec("ROLLBACK"); } catch {} throw error; }
  }

  createOrganization(o: Organization) { this.db.prepare("INSERT INTO organizations VALUES (?,?,?,?,?)").run(o.id,o.name,o.slug,o.createdAt,o.updatedAt); return o; }
  createMember(m: Member) { this.db.prepare("INSERT INTO members VALUES (?,?,?,?,?,?,?)").run(m.id,m.organizationId,m.email,m.displayName,m.role,m.createdAt,m.updatedAt); return m; }
  getMemberByEmail(email: string): Member | null { const r=this.db.prepare("SELECT id,organization_id,email,display_name,role,created_at,updated_at FROM members WHERE email=? LIMIT 1").get(email); return r?{id:String(r.id),organizationId:String(r.organization_id),email:String(r.email),displayName:String(r.display_name),role:r.role as Member["role"],createdAt:String(r.created_at),updatedAt:String(r.updated_at)}:null; }
  listMembers(orgId: string): Member[] { return this.db.prepare("SELECT id,organization_id,email,display_name,role,created_at,updated_at FROM members WHERE organization_id=? ORDER BY created_at").all(orgId).map(r=>({id:String(r.id),organizationId:String(r.organization_id),email:String(r.email),displayName:String(r.display_name),role:r.role as Member["role"],createdAt:String(r.created_at),updatedAt:String(r.updated_at)})); }
  createProject(p: BusinessProject) { this.db.prepare("INSERT INTO business_projects VALUES (?,?,?,?,?,?,?,?)").run(p.id,p.organizationId,p.name,p.sport,p.status,p.currentConfigurationId,p.createdAt,p.updatedAt); return p; }
  getProject(id: string): BusinessProject | null { const r=this.db.prepare("SELECT * FROM business_projects WHERE id=?").get(id); return r?{id:String(r.id),organizationId:String(r.organization_id),name:String(r.name),sport:String(r.sport),status:r.status as BusinessProject["status"],currentConfigurationId:r.current_configuration_id?String(r.current_configuration_id):null,createdAt:String(r.created_at),updatedAt:String(r.updated_at)}:null; }
  listProjects(orgId: string): BusinessProject[] { return this.db.prepare("SELECT * FROM business_projects WHERE organization_id=? ORDER BY created_at").all(orgId).map(r=>({id:String(r.id),organizationId:String(r.organization_id),name:String(r.name),sport:String(r.sport),status:r.status as BusinessProject["status"],currentConfigurationId:r.current_configuration_id?String(r.current_configuration_id):null,createdAt:String(r.created_at),updatedAt:String(r.updated_at)})); }
  createConfiguration(c: ProjectConfiguration) { this.db.prepare("INSERT INTO project_configurations VALUES (?,?,?,?,?,?,?,?,?)").run(c.id,c.projectId,c.version,c.definitionJson,c.engineVersion,c.resolutionJson,c.createdAt,c.createdBy); this.db.prepare("UPDATE business_projects SET current_configuration_id=?,updated_at=? WHERE id=?").run(c.id,c.createdAt,c.projectId); return c; }
  listConfigurations(projectId: string): ProjectConfiguration[] { return this.db.prepare("SELECT * FROM project_configurations WHERE project_id=? ORDER BY version DESC").all(projectId).map(r=>({id:String(r.id),projectId:String(r.project_id),version:Number(r.version),definitionJson:String(r.definition_json),engineVersion:r.engine_version?String(r.engine_version):null,resolutionJson:r.resolution_json?String(r.resolution_json):null,createdAt:String(r.created_at),createdBy:String(r.created_by)})); }
  createContract(c: Contract) { this.db.prepare("INSERT INTO contracts VALUES (?,?,?,?,?,?,?,?,?)").run(c.id,c.projectId,c.number,c.status,c.currency,c.totalCents,c.validUntil,c.createdAt,c.updatedAt); return c; }
  listContracts(projectId: string): Contract[] { return this.db.prepare("SELECT * FROM contracts WHERE project_id=? ORDER BY created_at DESC").all(projectId).map(r=>({id:String(r.id),projectId:String(r.project_id),number:String(r.number),status:r.status as Contract["status"],currency:String(r.currency),totalCents:Number(r.total_cents),validUntil:r.valid_until?String(r.valid_until):null,createdAt:String(r.created_at),updatedAt:String(r.updated_at)})); }
  createInstallation(i: Installation) { this.db.prepare("INSERT INTO installations VALUES (?,?,?,?,?,?,?,?)").run(i.id,i.projectId,i.status,i.scheduledAt,i.completedAt,i.notes,i.createdAt,i.updatedAt); return i; }
  listInstallations(projectId: string): Installation[] { return this.db.prepare("SELECT * FROM installations WHERE project_id=? ORDER BY created_at DESC").all(projectId).map(r=>({id:String(r.id),projectId:String(r.project_id),status:r.status as Installation["status"],scheduledAt:r.scheduled_at?String(r.scheduled_at):null,completedAt:r.completed_at?String(r.completed_at):null,notes:r.notes?String(r.notes):null,createdAt:String(r.created_at),updatedAt:String(r.updated_at)})); }
  createHardware(h: InstalledHardware) { this.db.prepare("INSERT INTO installed_hardware VALUES (?,?,?,?,?,?,?,?,?)").run(h.id,h.projectId,h.installationId,h.catalogHardwareId,h.serialNumber,h.quantity,h.status,h.createdAt,h.updatedAt); return h; }
  listHardware(projectId: string): InstalledHardware[] { return this.db.prepare("SELECT * FROM installed_hardware WHERE project_id=? ORDER BY created_at").all(projectId).map(r=>({id:String(r.id),projectId:String(r.project_id),installationId:r.installation_id?String(r.installation_id):null,catalogHardwareId:String(r.catalog_hardware_id),serialNumber:r.serial_number?String(r.serial_number):null,quantity:Number(r.quantity),status:r.status as InstalledHardware["status"],createdAt:String(r.created_at),updatedAt:String(r.updated_at)})); }
  updateProjectStatus(id: string, status: BusinessProject["status"], updatedAt: string) {
    const current = this.getProject(id);
    if (!current) throw new Error("BUSINESS_PROJECT_NOT_FOUND");
    const next = transitionProject(current.status, status);
    this.db.prepare("UPDATE business_projects SET status=?,updated_at=? WHERE id=?").run(next, updatedAt, id);
    return { ...current, status: next, updatedAt };
  }

  updateContractStatus(id: string, status: Contract["status"], updatedAt: string) {
    const current = this.db.prepare("SELECT * FROM contracts WHERE id=?").get(id);
    if (!current) throw new Error("CONTRACT_NOT_FOUND");
    const next = transitionContract(String(current.status) as Contract["status"], status);
    this.db.prepare("UPDATE contracts SET status=?,updated_at=? WHERE id=?").run(next, updatedAt, id);
    return { ...this.listContracts(String(current.project_id)).find((contract) => contract.id === id)!, status: next, updatedAt };
  }

  updateInstallationStatus(id: string, status: Installation["status"], updatedAt: string) {
    const current = this.db.prepare("SELECT * FROM installations WHERE id=?").get(id);
    if (!current) throw new Error("INSTALLATION_NOT_FOUND");
    const next = transitionInstallation(String(current.status) as Installation["status"], status);
    const completedAt = next === "installed" ? updatedAt : (current.completed_at ? String(current.completed_at) : null);
    this.db.prepare("UPDATE installations SET status=?,completed_at=?,updated_at=? WHERE id=?").run(next, completedAt, updatedAt, id);
    return { ...this.listInstallations(String(current.project_id)).find((installation) => installation.id === id)!, status: next, completedAt, updatedAt };
  }

  audit(e: AuditEvent) { this.db.prepare("INSERT INTO audit_events VALUES (?,?,?,?,?,?,?,?)").run(e.id,e.organizationId,e.actorMemberId,e.action,e.resourceType,e.resourceId,e.metadataJson,e.createdAt); return e; }
  listAudit(orgId: string): AuditEvent[] { return this.db.prepare("SELECT * FROM audit_events WHERE organization_id=? ORDER BY created_at DESC").all(orgId).map(r=>({id:String(r.id),organizationId:String(r.organization_id),actorMemberId:r.actor_member_id?String(r.actor_member_id):null,action:String(r.action),resourceType:String(r.resource_type),resourceId:String(r.resource_id),metadataJson:String(r.metadata_json),createdAt:String(r.created_at)})); }
}
