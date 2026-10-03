import { readFile } from "node:fs/promises";
import { resolveProject } from "./engine.js";
import { HardwareCatalogSchema, ModuleCatalogSchema, RuleCatalogSchema } from "./catalog-schema.js";

const root = process.cwd();
const read = async (path: string) => JSON.parse(await readFile(path, "utf8")) as unknown;
const modules = ModuleCatalogSchema.parse(await read(root + "/catalog/modules.json"));
const rules = RuleCatalogSchema.parse(await read(root + "/catalog/rules.json"));
const hardware = HardwareCatalogSchema.parse(await read(root + "/catalog/hardware/cameras.json"));
const result = resolveProject({ project: { id: "catalog", version: "1", sport: "validation", modules: modules.modules.map(m => m.id) } }, { modules: modules.modules, rules: rules.rules, hardware: hardware.items });
if (!result.valid) throw new Error(JSON.stringify(result.diagnostics));
console.log({ valid: true, engineVersion: result.engineVersion, modules: modules.modules.length, hardware: hardware.items.length, rules: rules.rules.length });
