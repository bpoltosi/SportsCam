import { describe, expect, it } from "vitest";
import { resolveProject } from "../packages/engine/src/engine.js";

describe("Engine advanced resolution", () => {
  const catalog = {
    modules: [
      { id: "camera", version: "1" },
      { id: "recording", version: "1", requires: ["camera"] },
    ],
    hardware: [
      { id: "cam-a", category: "camera", model: "A", capabilities: { resolution: { width: 1920, height: 1080 } } },
    ],
    rules: [
      {
        id: "needs-1080p",
        when: { module: "recording" },
        then: { requiresCapability: { key: "resolution", value: { width: 1920, height: 1080 } } },
        severity: "error" as const,
        message: "1080p camera required",
      },
    ],
  };

  it("matches nested capabilities", () => {
    const result = resolveProject(
      { project: { id: "demo", version: "1", sport: "football", modules: ["recording"] } },
      catalog,
    );
    expect(result.valid).toBe(true);
    expect(result.compatibleHardware).toEqual(["cam-a"]);
  });

  it("detects dependency cycles", () => {
    const result = resolveProject(
      { project: { id: "demo", version: "1", sport: "football", modules: ["a"] } },
      {
        ...catalog,
        modules: [
          { id: "a", version: "1", requires: ["b"] },
          { id: "b", version: "1", requires: ["a"] },
        ],
      },
    );
    expect(result.valid).toBe(false);
    expect(result.diagnostics.some((d) => d.code === "MODULE_DEPENDENCY_CYCLE")).toBe(true);
  });

  it("aggregates duplicate hardware selections", () => {
    const result = resolveProject(
      {
        project: {
          id: "demo",
          version: "1",
          sport: "football",
          modules: [],
          hardware: [{ id: "cam-a", quantity: 1 }, { id: "cam-a", quantity: 2 }],
        },
      },
      catalog,
    );
    expect(result.bom).toEqual([
      { hardwareId: "cam-a", quantity: 3, source: { type: "project" } },
    ]);
  });
});
