import { DatabaseSync } from "node:sqlite";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { z } from "zod";
import { resolveProject } from "../../../packages/engine/src/engine.js";
import type { EngineCatalog, ProjectDefinition } from "../../../packages/engine/src/engine.js";
import { SQLiteProjectRepository, SQLiteResolutionRepository, BusinessRepository, runMigrations } from "../../../packages/persistence/src/index.js";
import { AuthService } from "../../../packages/auth/src/index.js";

const app = Fastify({ logger: true });
await app.register(cors, { origin: true });
const dbPath = process.env.DATABASE_PATH ?? "sportscam.db";
const db = new DatabaseSync(dbPath);
db.exec("PRAGMA foreign_keys = ON;");
runMigrations(db);
const projectRepository = new SQLiteProjectRepository(dbPath);
const resolutionRepository = new SQLiteResolutionRepository(db);
const business = new BusinessRepository(db);
const auth = new AuthService(db);

const ProjectSchema = z.object({ project: z.object({
  id: z.string().min(1), version: z.string().min(1), sport: z.string().min(1),
  modules: z.array(z.string()).default([]),
  hardware: z.array(z.object({ id: z.string().min(1), quantity: z.number().int().positive() })).optional(),
  profile: z.string().optional(),
}) });
const OrganizationSchema = z.object({ name: z.string().min(1), slug: z.string().regex(/^[a-z0-9-]+$/) });
const RegisterSchema = z.object({ organizationName:z.string().min(1), slug:z.string().regex(/^[a-z0-9-]+$/), email:z.string().email(), displayName:z.string().min(1), password:z.string().min(12) });
const LoginSchema = z.object({ email:z.string().email(), password:z.string().min(1) });
const MemberSchema = z.object({ email: z.string().email(), displayName: z.string().min(1), role: z.enum(["owner","admin","manager","operator","viewer"]) });
const BusinessProjectSchema = z.object({ name: z.string().min(1), sport: z.string().min(1) });
const ContractSchema = z.object({ number: z.string().min(1), currency: z.string().length(3), totalCents: z.number().int().nonnegative(), validUntil: z.string().datetime().nullable().optional() });
const InstallationSchema = z.object({ status: z.enum(["planned","scheduled","in_progress","installed","blocked","cancelled"]).default("planned"), scheduledAt: z.string().datetime().nullable().optional(), notes: z.string().nullable().optional() });
const HardwareSchema = z.object({ catalogHardwareId: z.string().min(1), quantity: z.number().int().positive(), serialNumber: z.string().nullable().optional(), installationId: z.string().nullable().optional() });

type ModuleCatalog = { modules: EngineCatalog["modules"] };
type RuleCatalog = { rules: EngineCatalog["rules"] };
type CameraCatalog = { items: EngineCatalog["hardware"] };
async function readJson<T>(path: string): Promise<T> {
  const { readFile } = await import("node:fs/promises");
  return JSON.parse(await readFile(path, "utf8")) as T;
}
async function loadCatalog(): Promise<EngineCatalog> {
  const root = process.cwd();
  const [modules, rules, cameras] = await Promise.all([
    readJson<ModuleCatalog>(root + "/catalog/modules.json"),
    readJson<RuleCatalog>(root + "/catalog/rules.json"),
    readJson<CameraCatalog>(root + "/catalog/hardware/cameras.json"),
  ]);
  return { modules: modules.modules, rules: rules.rules, hardware: cameras.items };
}
const now = () => new Date().toISOString();
app.addHook("preHandler", async (request, reply) => {
  if (request.url === "/health" || request.url.startsWith("/v1/auth/")) return;
  const header=request.headers.authorization;
  const token=header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token || !auth.authenticate(token)) return reply.code(401).send({error:"UNAUTHORIZED"});
});

app.get("/health", async () => ({ status: "ok", service: "sportscam-api", engine: "0.1.0" }));
app.post("/v1/auth/register", async (request, reply) => {
  const parsed=RegisterSchema.safeParse(request.body); if(!parsed.success) return reply.code(400).send({error:"INVALID_REGISTRATION",issues:parsed.error.issues});
  const timestamp=now(), organization={id:crypto.randomUUID(),name:parsed.data.organizationName,slug:parsed.data.slug,createdAt:timestamp,updatedAt:timestamp};
  try {
    business.createOrganization(organization);
    const member=business.createMember({id:crypto.randomUUID(),organizationId:organization.id,email:parsed.data.email,displayName:parsed.data.displayName,role:"owner",createdAt:timestamp,updatedAt:timestamp});
    auth.setPassword(member.id,parsed.data.password);
    const session=auth.createSession(member.id);
    return reply.code(201).send({organization,member,session});
  } catch(e) { return reply.code(409).send({error:"REGISTRATION_FAILED"}); }
});
app.post("/v1/auth/login", async (request, reply) => {
  const parsed=LoginSchema.safeParse(request.body); if(!parsed.success) return reply.code(400).send({error:"INVALID_LOGIN"});
  const member=business.getMemberByEmail(parsed.data.email);
  if(!member || !auth.verifyPassword(member.id,parsed.data.password)) return reply.code(401).send({error:"INVALID_CREDENTIALS"});
  return {session:auth.createSession(member.id),member};
});

app.get("/v1/projects", async () => projectRepository.list());
app.get("/v1/projects/:id", async (request, reply) => {
  const { id } = z.object({ id: z.string().min(1) }).parse(request.params);
  const project = await projectRepository.get(id);
  return project ? project : reply.code(404).send({ error: "PROJECT_NOT_FOUND" });
});
app.post("/v1/projects", async (request, reply) => {
  const parsed = ProjectSchema.safeParse(request.body);
  if (!parsed.success) return reply.code(400).send({ error: "INVALID_PROJECT_DEFINITION", issues: parsed.error.issues });
  const timestamp = now();
  try { return reply.code(201).send(await projectRepository.create({ id: parsed.data.project.id, name: parsed.data.project.id, definitionJson: JSON.stringify(parsed.data), createdAt: timestamp, updatedAt: timestamp })); }
  catch (e) { if (e instanceof Error && e.message === "PROJECT_ALREADY_EXISTS") return reply.code(409).send({ error: e.message }); throw e; }
});
app.put("/v1/projects/:id", async (request, reply) => {
  const { id } = z.object({ id: z.string().min(1) }).parse(request.params);
  const parsed = ProjectSchema.safeParse(request.body);
  if (!parsed.success) return reply.code(400).send({ error: "INVALID_PROJECT_DEFINITION", issues: parsed.error.issues });
  const current = await projectRepository.get(id);
  if (!current) return reply.code(404).send({ error: "PROJECT_NOT_FOUND" });
  return projectRepository.update({ ...current, definitionJson: JSON.stringify(parsed.data), updatedAt: now() });
});
app.delete("/v1/projects/:id", async (request, reply) => {
  const { id } = z.object({ id: z.string().min(1) }).parse(request.params);
  if (!await projectRepository.get(id)) return reply.code(404).send({ error: "PROJECT_NOT_FOUND" });
  await projectRepository.delete(id); return reply.code(204).send();
});
app.post("/v1/engine/resolve", async (request, reply) => {
  const parsed = ProjectSchema.safeParse(request.body);
  if (!parsed.success) return reply.code(400).send({ error: "INVALID_PROJECT_DEFINITION", issues: parsed.error.issues });
  const result = resolveProject(parsed.data as ProjectDefinition, await loadCatalog());
  const project = await projectRepository.get(parsed.data.project.id);
  if (project) resolutionRepository.save({ id: crypto.randomUUID(), projectId: project.id, engineVersion: result.engineVersion, createdAt: now(), inputJson: JSON.stringify(parsed.data), resultJson: JSON.stringify(result) });
  return result;
});
app.get("/v1/projects/:id/resolutions", async (request, reply) => {
  const { id } = z.object({ id: z.string().min(1) }).parse(request.params);
  if (!await projectRepository.get(id)) return reply.code(404).send({ error: "PROJECT_NOT_FOUND" });
  return resolutionRepository.listByProject(id);
});

app.post("/v1/organizations", async (request, reply) => {
  const parsed=OrganizationSchema.safeParse(request.body); if(!parsed.success) return reply.code(400).send({error:"INVALID_ORGANIZATION",issues:parsed.error.issues});
  const o={id:crypto.randomUUID(),...parsed.data,createdAt:now(),updatedAt:now()}; return reply.code(201).send(business.createOrganization(o));
});
app.post("/v1/organizations/:orgId/members", async (request, reply) => {
  const {orgId}=z.object({orgId:z.string().min(1)}).parse(request.params); const parsed=MemberSchema.safeParse(request.body);
  if(!parsed.success) return reply.code(400).send({error:"INVALID_MEMBER",issues:parsed.error.issues});
  const m={id:crypto.randomUUID(),organizationId:orgId,...parsed.data,createdAt:now(),updatedAt:now()}; return reply.code(201).send(business.createMember(m));
});
app.get("/v1/organizations/:orgId/members", async request => business.listMembers(z.object({orgId:z.string().min(1)}).parse(request.params).orgId));
app.post("/v1/organizations/:orgId/projects", async (request, reply) => {
  const {orgId}=z.object({orgId:z.string().min(1)}).parse(request.params); const parsed=BusinessProjectSchema.safeParse(request.body);
  if(!parsed.success) return reply.code(400).send({error:"INVALID_BUSINESS_PROJECT",issues:parsed.error.issues});
  const p={id:crypto.randomUUID(),organizationId:orgId,...parsed.data,status:"draft" as const,currentConfigurationId:null,createdAt:now(),updatedAt:now()}; return reply.code(201).send(business.createProject(p));
});
app.get("/v1/organizations/:orgId/projects", async request => business.listProjects(z.object({orgId:z.string().min(1)}).parse(request.params).orgId));
app.get("/v1/business-projects/:projectId/configurations", async request => business.listConfigurations(z.object({projectId:z.string().min(1)}).parse(request.params).projectId));
app.post("/v1/business-projects/:projectId/configurations", async (request, reply) => {
  const {projectId}=z.object({projectId:z.string().min(1)}).parse(request.params);
  const project=business.getProject(projectId); if(!project) return reply.code(404).send({error:"BUSINESS_PROJECT_NOT_FOUND"});
  const body=ProjectSchema.safeParse(request.body); if(!body.success) return reply.code(400).send({error:"INVALID_PROJECT_DEFINITION",issues:body.error.issues});
  const versions=business.listConfigurations(projectId); const result=resolveProject(body.data as ProjectDefinition,await loadCatalog()); const c={id:crypto.randomUUID(),projectId,version:(versions[0]?.version ?? 0)+1,definitionJson:JSON.stringify(body.data),engineVersion:result.engineVersion,resolutionJson:JSON.stringify(result),createdAt:now(),createdBy:"system"}; return reply.code(201).send(business.createConfiguration(c));
});
app.post("/v1/business-projects/:projectId/contracts", async (request, reply) => {
  const {projectId}=z.object({projectId:z.string().min(1)}).parse(request.params); const parsed=ContractSchema.safeParse(request.body);
  if(!parsed.success) return reply.code(400).send({error:"INVALID_CONTRACT",issues:parsed.error.issues});
  const c={id:crypto.randomUUID(),projectId,...parsed.data,status:"draft" as const,validUntil:parsed.data.validUntil??null,createdAt:now(),updatedAt:now()}; return reply.code(201).send(business.createContract(c));
});
app.get("/v1/business-projects/:projectId/contracts", async request => business.listContracts(z.object({projectId:z.string().min(1)}).parse(request.params).projectId));
app.post("/v1/business-projects/:projectId/installations", async (request, reply) => {
  const {projectId}=z.object({projectId:z.string().min(1)}).parse(request.params); const parsed=InstallationSchema.safeParse(request.body);
  if(!parsed.success) return reply.code(400).send({error:"INVALID_INSTALLATION",issues:parsed.error.issues});
  const i={id:crypto.randomUUID(),projectId,...parsed.data,status:parsed.data.status,scheduledAt:parsed.data.scheduledAt??null,completedAt:null,notes:parsed.data.notes??null,createdAt:now(),updatedAt:now()}; return reply.code(201).send(business.createInstallation(i));
});
app.get("/v1/business-projects/:projectId/installations", async request => business.listInstallations(z.object({projectId:z.string().min(1)}).parse(request.params).projectId));
app.post("/v1/business-projects/:projectId/hardware", async (request, reply) => {
  const {projectId}=z.object({projectId:z.string().min(1)}).parse(request.params); const parsed=HardwareSchema.safeParse(request.body);
  if(!parsed.success) return reply.code(400).send({error:"INVALID_INSTALLED_HARDWARE",issues:parsed.error.issues});
  const h={id:crypto.randomUUID(),projectId,...parsed.data,quantity:parsed.data.quantity,serialNumber:parsed.data.serialNumber??null,installationId:parsed.data.installationId??null,status:"planned" as const,createdAt:now(),updatedAt:now()}; return reply.code(201).send(business.createHardware(h));
});
app.get("/v1/business-projects/:projectId/hardware", async request => business.listHardware(z.object({projectId:z.string().min(1)}).parse(request.params).projectId));
app.get("/v1/organizations/:orgId/audit", async request => business.listAudit(z.object({orgId:z.string().min(1)}).parse(request.params).orgId));

await app.listen({ host:"0.0.0.0", port:Number(process.env.PORT??3000) });
