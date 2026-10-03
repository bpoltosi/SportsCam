import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { z } from "zod";
import { resolveProject } from "../../../packages/engine/src/engine.js";
import type { EngineCatalog, ProjectDefinition } from "../../../packages/engine/src/engine.js";

const app = Fastify({ logger: true });
await app.register(cors, { origin: true });

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
  const root = resolve(process.cwd());
  const modules = JSON.parse(
    await readFile(resolve(root, "catalog/modules.json"), "utf8"),
  ) as ModuleCatalog;
  const rules = JSON.parse(
    await readFile(resolve(root, "catalog/rules.json"), "utf8"),
  ) as RuleCatalog;
  const cameras = JSON.parse(
    await readFile(resolve(root, "catalog/hardware/cameras.json"), "utf8"),
  ) as CameraCatalog;

  return { modules: modules.modules, rules: rules.rules, hardware: cameras.items };
}

app.get("/health", async () => ({
  status: "ok",
  service: "sportscam-api",
  engine: "0.1.0",
}));

app.post("/v1/engine/resolve", async (request, reply) => {
  const parsed = ProjectSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.code(400).send({
      error: "INVALID_PROJECT_DEFINITION",
      issues: parsed.error.issues,
    });
  }

  const catalog = await loadCatalog();
  return reply.send(resolveProject(parsed.data as ProjectDefinition, catalog));
});

await app.listen({ host: "0.0.0.0", port: Number(process.env.PORT ?? 3000) });
