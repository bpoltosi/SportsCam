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

  const catalog: EngineCatalog = {
    modules: [
      { id: "camera_capture", version: "1.0.0", provides: ["video_input"] },
      {
        id: "video_recording",
        version: "1.0.0",
        requires: ["camera_capture"],
        provides: ["recorded_video"],
      },
      {
        id: "instant_replay",
        version: "1.0.0",
        requires: ["camera_capture", "video_recording"],
        provides: ["replay_buffer", "replay_control"],
      },
    ],
    hardware: [],
    rules: [],
  };

  const result = resolveProject(parsed.data as ProjectDefinition, catalog);
  return reply.send(result);
});

app.listen({ host: "0.0.0.0", port: Number(process.env.PORT ?? 3000) });
