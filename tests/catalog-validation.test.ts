import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolveProject } from "../packages/engine/src/engine.js";
import { HardwareCatalogSchema, ModuleCatalogSchema, RuleCatalogSchema } from "../packages/engine/src/catalog-schema.js";

const root = process.cwd();
const json = (path: string) => JSON.parse(readFileSync(path, "utf8"));
describe("catalog integrity", () => {
  it("matches runtime schemas", () => {
    expect(() => ModuleCatalogSchema.parse(json(root + "/catalog/modules.json"))).not.toThrow();
    expect(() => RuleCatalogSchema.parse(json(root + "/catalog/rules.json"))).not.toThrow();
    expect(() => HardwareCatalogSchema.parse(json(root + "/catalog/hardware/cameras.json"))).not.toThrow();
  });
  it("resolves the complete module catalog without errors", () => {
    const modules = ModuleCatalogSchema.parse(json(root + "/catalog/modules.json"));
    const rules = RuleCatalogSchema.parse(json(root + "/catalog/rules.json"));
    const hardware = HardwareCatalogSchema.parse(json(root + "/catalog/hardware/cameras.json"));
    const result = resolveProject({ project: { id: "catalog", version: "1", sport: "validation", modules: modules.modules.map(m => m.id) } }, { modules: modules.modules, rules: rules.rules, hardware: hardware.items });
    expect(result.diagnostics.filter(d => d.severity === "error")).toEqual([]);
  });
});
