import { describe, expect, it } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openDatabase } from "../src/database.js";
import { MediaRepository } from "../src/media.js";

describe("MediaRepository", () => {
  it("registers a device and authenticates its one-time credential", () => {
    const dir = mkdtempSync(join(tmpdir(), "sportscam-"));
    const db = openDatabase(join(dir, "test.db"));
    db.prepare("INSERT INTO organizations(id,name,slug,created_at,updated_at) VALUES (?,?,?,?,?)").run("org-1","Org","org",new Date().toISOString(),new Date().toISOString());
    const repo = new MediaRepository(db);
    const device = repo.registerDevice({id:"dev-1",organizationId:"org-1",name:"Edge 1",agentVersion:"0.1.0"});
    expect(device.token.length).toBeGreaterThan(20);
    expect(repo.authenticateDevice(device.token)?.id).toBe("dev-1");
    expect(repo.authenticateDevice("wrong-token")).toBeNull();
    db.close();
  });

  it("enqueues a clip and its processing job atomically", () => {
    const dir = mkdtempSync(join(tmpdir(), "sportscam-"));
    const db = openDatabase(join(dir, "test.db"));
    const now = new Date().toISOString();
    db.prepare("INSERT INTO organizations(id,name,slug,created_at,updated_at) VALUES (?,?,?,?,?)").run("org-1","Org","org",now,now);
    const repo = new MediaRepository(db);
    repo.createEvent({id:"event-1",organizationId:"org-1",projectId:null,recordingId:null,timestampMs:0,type:"goal",source:"manual",metadataJson:"{}"});
    const clip=repo.enqueueClip({id:"clip-1",organizationId:"org-1",eventId:"event-1",preSeconds:10,postSeconds:10,sourceRevision:1});
    expect(String(clip?.status)).toBe("queued");
    expect(Number(db.prepare("SELECT COUNT(*) c FROM processing_jobs WHERE resource_id='clip-1'").get().c)).toBe(1);
    db.close();
  });
});
