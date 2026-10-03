import { describe, expect, it } from "vitest";
import { resolveProject } from "../packages/engine/src/engine.js";

describe("SportsCam Engine", () => {
  it("resolves module dependencies deterministically", () => {
    const result = resolveProject(
      {
        project: {
          id: "demo",
          version: "1.0.0",
          sport: "football",
          modules: ["instant_replay"],
        },
      },
      {
        modules: [
          { id: "camera_capture", version: "1.0.0" },
          {
            id: "video_recording",
            version: "1.0.0",
            requires: ["camera_capture"],
          },
          {
            id: "instant_replay",
            version: "1.0.0",
            requires: ["camera_capture", "video_recording"],
          },
        ],
        hardware: [],
        rules: [],
      },
    );

    expect(result.valid).toBe(true);
    expect(result.modules).toEqual([
      "camera_capture",
      "instant_replay",
      "video_recording",
    ]);
    expect(result.dependencies).toEqual(["camera_capture", "video_recording"]);
  });

  it("reports unknown modules instead of inventing them", () => {
    const result = resolveProject(
      {
        project: {
          id: "demo",
          version: "1.0.0",
          sport: "football",
          modules: ["does_not_exist"],
        },
      },
      { modules: [], hardware: [], rules: [] },
    );

    expect(result.valid).toBe(false);
    expect(result.diagnostics[0]?.code).toBe("MODULE_NOT_FOUND");
  });
});
