import { describe, expect, it } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { SQLiteProjectRepository } from "../packages/persistence/src/sqlite.js";

describe("SQLiteProjectRepository", () => {
  it("persists projects across repository instances", async () => {
    const dir = mkdtempSync(join(tmpdir(), "sportscam-"));
    const path = join(dir, "test.db");
    const project = {
      id: "p1",
      name: "Quadra 01",
      definitionJson: '{"project":{"id":"p1"}}',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const first = new SQLiteProjectRepository(path);
    await first.create(project);
    first.close();

    const second = new SQLiteProjectRepository(path);
    await expect(second.get("p1")).resolves.toEqual(project);
    second.close();
  });
});
