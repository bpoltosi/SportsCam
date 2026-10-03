import Fastify from "fastify";
import cors from "@fastify/cors";
import { z } from "zod";
import { resolveProject } from "../../../packages/engine/src/engine.js";
import type { EngineCatalog, ProjectDefinition } from "../../../packages/engine/src/engine.js";
import { InMemoryProjectRepository } from "../../../packages/persistence/src/index.js";

const app = Fastify({ logger: true });
await app.register(cors, { origin: true });

const projectRepository = new InMemoryProjectRepository();

const ProjectSchema = z.object({
  project: z.object({
    id: z.string().min(1),
    version: z.string().min(1),
    sport: z.string().min(1),
    modules: z.array(z.string()).default([]),
    hardware: z.array(z.object({
      id: z.string().min(1),
      quantity: z.number().int().positive(),
    })).optional(),
    profile: z.string().optional(),
  }),
});

type ModuleCatalog = { modules: EngineCatalog["modules"] };
type RuleCatalog = { rules: EngineCatalog["rules"] };
type CameraCatalog = { items: EngineCatalog["hardware"] };

async function loadCatalog(): Promise<EngineCatalog> {
  const root = process.cwd();
  const [modules, rules, cameras] = await Promise.all([
    Bunless.readJson<ModuleCatalog>(root + "/catalog/modules.json"),
    Bunless.readJson<RuleCatalog>(root + "/catalog/rules.json"),
    Bunless.readJson<CameraCatalog>(root + "/catalog/hardware/cameras.json"),
  ]);
  return { modules: modules.modules, rules: rules.rules, hardware: cameras.items };
}

const Bunless = {
  async readJson<T>(path: string): Promise<T> {
    const { readFile } = await import("node:fs/promises");
    return JSON.parse(await readFile(path, "utf8")) as T;
  },
};

app.get("/health", async () => ({
  status: "ok",
  service: "sportscam-api",
  engine: "0.1.0",
}));

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
    const project = await projectRepository.create({
      id: parsed.data.project.id,
      name: parsed.data.project.id,
      definitionJson: JSON.stringify(parsed.data),
      createdAt: now,
      updatedAt: now,
    });
    return reply.code(201).send(project);
  } catch (error) {
    if (error instanceof Error && error.message === "PROJECT_ALREADY_EXISTS") {
      return reply.code(409).send({ error: "PROJECT_ALREADY_EXISTS" });
    }
    throw error;
  }
});

app.post("/v1/engine/resolve", async (request, reply) => {
  const parsed = ProjectSchema.safeParse(request.body);
  if (!parsed.success) return reply.code(400).send({ error: "INVALID_PROJECT_DEFINITION", issues: parsed.error.issues });

  const catalog = await loadCatalog();
  return reply.send(resolveProject(parsed.data as ProjectDefinition, catalog));
});

await app.listen({ host: "0.0.0.0", port: Number(process.env.PORT ?? 3000) });
