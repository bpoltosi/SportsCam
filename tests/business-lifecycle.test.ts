import { describe, expect, it } from "vitest";
import { mkdtempSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { openDatabase, BusinessRepository } from "../packages/persistence/src/index.js";

describe("business lifecycle persistence", () => {
  it("rejects invalid project transitions", () => {
    const dir = mkdtempSync(join(tmpdir(), "sportscam-lifecycle-"));
    const db = openDatabase(join(dir, "test.db"));
    const repository = new BusinessRepository(db);
    const timestamp = new Date().toISOString();

    repository.createOrganization({ id: "org", name: "Org", slug: "org", createdAt: timestamp, updatedAt: timestamp });
    repository.createProject({
      id: "project",
      organizationId: "org",
      name: "Arena",
      sport: "football",
      status: "draft",
      currentConfigurationId: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    expect(() => repository.updateProjectStatus("project", "operational", timestamp))
      .toThrow("INVALID_PROJECT_STATUS_TRANSITION");

    db.close();
  });

  it("updates project lifecycle status", () => {
    const dir = mkdtempSync(join(tmpdir(), "sportscam-lifecycle-"));
    const db = openDatabase(join(dir, "test.db"));
    const repository = new BusinessRepository(db);
    const timestamp = new Date().toISOString();

    repository.createOrganization({ id: "org", name: "Org", slug: "org", createdAt: timestamp, updatedAt: timestamp });
    repository.createProject({
      id: "project",
      organizationId: "org",
      name: "Arena",
      sport: "football",
      status: "draft",
      currentConfigurationId: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    const updated = repository.updateProjectStatus("project", "quoted", timestamp);
    expect(updated.status).toBe("quoted");
    expect(repository.getProject("project")?.status).toBe("quoted");

    db.close();
  });
});
