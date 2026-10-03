import { DatabaseSync } from "node:sqlite";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { z } from "zod";
import { resolveProject } from "../../../packages/engine/src/engine.js";
import type { EngineCatalog, ProjectDefinition } from "../../../packages/engine/src/engine.js";
import { SQLiteProjectRepository, SQLiteResolutionRepository } from "../../../packages/persistence/src/index.js";

const app = Fastify({ logger: true });
await app.register(cors, { origin: true });

const db = new DatabaseSync(process.env.DATABASE_PATH ?? "sportscam.db");
db.exec("PRAGMA foreign_keys = ON;");
const projectRepository = new SQLiteProjectRepository(process.env.DATABASE_PATH ?? "sportscam.db");
const resolutionRepository = new SQLiteResolutionRepository(db);

const ProjectSchema = z.object({
  project: z.object({
    id: z.string().min(1),
    version: z.string().min(1),
    sport: z.string().min(1),
    modules: z.array(z.string()).default([]),
    hardware: z.array(z.object({ id: z.string().min(1), quantity: z.number().int().positive() })).optional(),
    profile: z.string().optional(),
  }),
});

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

app.get("/health", async () => ({ status: "ok", service: "sportscam-api", engine: "0.1.0" }));

app.get("/v1/projects", async () => projectRepository.list());

app.get("/v1/projects/:id", async (request, reply) => {
  const params = z.object({ id: z.string().min(1) }).parse(request.params);
  const project = await projectRepository.get(params.id);
  if (!project) return reply.code(404).send({ error: "PROJECT_NOT_FOUND" });
  return project;
});

app.post("/v1/projects", async (request, reply) => {
  const parsed = ProjectSchema.safeParse(request.body);
  if (!parsed.success) return reply.code(400).send({ error: "INVALID_PROJECT_DEFINITION", issues: parsed.error.issues });
  const now = new Date().toISOString();
  try {
    return reply.code(201).send(await projectRepository.create({
      id: parsed.data.project.id,
      name: parsed.data.project.id,
      definitionJson: JSON.stringify(parsed.data),
      createdAt: now,
      updatedAt: now,
    }));
  } catch (error) {
    if (error instanceof Error && error.message === "PROJECT_ALREADY_EXISTS") return reply.code(409).send({ error: "PROJECT_ALREADY_EXISTS" });
    throw error;
  }
});

app.put("/v1/projects/:id", async (request, reply) => {
  const params = z.object({ id: z.string().min(1) }).parse(request.params);
  const parsed = ProjectSchema.safeParse(request.body);
  if (!parsed.success) return reply.code(400).send({ error: "INVALID_PROJECT_DEFINITION", issues: parsed.error.issues });
  try {
    const current = await projectRepository.get(params.id);
    if (!current) return reply.code(404).send({ error: "PROJECT_NOT_FOUND" });
    return reply.send(await projectRepository.update({
      ...current,
      definitionJson: JSON.stringify(parsed.data),
      updatedAt: new Date().toISOString(),
    }));
  } catch (error) {
    if (error instanceof Error && error.message === "PROJECT_NOT_FOUND") return reply.code(404).send({ error: "PROJECT_NOT_FOUND" });
    throw error;
  }
});

app.delete("/v1/projects/:id", async (request, reply) => {
  const params = z.object({ id: z.string().min(1) }).parse(request.params);
  if (!await projectRepository.get(params.id)) return reply.code(404).send({ error: "PROJECT_NOT_FOUND" });
  await projectRepository.delete(params.id);
  return reply.code(204).send();
});

app.post("/v1/engine/resolve", async (request, reply) => {
  const parsed = ProjectSchema.safeParse(request.body);
  if (!parsed.success) return reply.code(400).send({ error: "INVALID_PROJECT_DEFINITION", issues: parsed.error.issues });

  const result = resolveProject(parsed.data as ProjectDefinition, await loadCatalog());
  const project = await projectRepository.get(parsed.data.project.id);
  if (project) {
    resolutionRepository.save({
      id: crypto.randomUUID(),
      projectId: project.id,
      engineVersion: result.engineVersion,
      createdAt: new Date().toISOString(),
      inputJson: JSON.stringify(parsed.data),
      resultJson: JSON.stringify(result),
    });
  }
  return reply.send(result);
});

app.get("/v1/projects/:id/resolutions", async (request, reply) => {
  const params = z.object({ id: z.string().min(1) }).parse(request.params);
  if (!await projectRepository.get(params.id)) return reply.code(404).send({ error: "PROJECT_NOT_FOUND" });
  return resolutionRepository.listByProject(params.id);
});

await app.listen({ host: "0.0.0.0", port: Number(process.env.PORT ?? 3000) });
