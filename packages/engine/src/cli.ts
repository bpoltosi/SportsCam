import { readFile } from "node:fs/promises";
import { resolveProject } from "./engine.js";
import type { EngineCatalog, ProjectDefinition } from "./engine.js";

const projectPath = process.argv[2];
const catalogPath = process.argv[3];

if (!projectPath || !catalogPath) {
  console.error("Usage: npm run engine -- <project.json> <catalog.json>");
  process.exit(1);
}

const project = JSON.parse(
  await readFile(projectPath, "utf8"),
) as ProjectDefinition;
const catalog = JSON.parse(
  await readFile(catalogPath, "utf8"),
) as EngineCatalog;

console.log(JSON.stringify(resolveProject(project, catalog), null, 2));
