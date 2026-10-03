import { describe, expect, it } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openDatabase, SQLiteProjectRepository } from "../packages/persistence/src/index.js";

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

    const firstDb = openDatabase(path);
    const first = new SQLiteProjectRepository(firstDb);
    await first.create(project);
    firstDb.close();

    const secondDb = openDatabase(path);
    const second = new SQLiteProjectRepository(secondDb);
    await expect(second.get("p1")).resolves.toEqual(project);
    secondDb.close();
  });

  it("applies migrations idempotently", () => {
    const dir = mkdtempSync(join(tmpdir(), "sportscam-migrations-"));
    const path = join(dir, "test.db");
    const db = openDatabase(path);
    openDatabase(path).close();
    const versions = db.prepare("SELECT version FROM schema_migrations ORDER BY version").all()
      .map(row => String(row.version));
    expect(versions).toEqual(["001", "002", "003", "004"]);
    db.close();
  });
});
