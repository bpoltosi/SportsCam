import { createHash, randomBytes } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";

export type DeviceStatus = "online" | "degraded" | "offline" | "disabled";
export type ClipStatus = "queued" | "processing" | "ready" | "failed" | "deleted";
export type JobStatus = "queued" | "running" | "succeeded" | "failed" | "dead_letter";

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export class MediaRepository {
  constructor(private readonly db: DatabaseSync) {}

  registerDevice(input: { id: string; organizationId: string; name: string; agentVersion: string; hardwareProfile?: string | null }) {
    const token = randomBytes(32).toString("base64url");
    const now = new Date().toISOString();
    this.db.prepare(
      "INSERT INTO devices(id,organization_id,name,status,agent_version,hardware_profile,credential_hash,last_heartbeat_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)",
    ).run(input.id,input.organizationId,input.name,"offline",input.agentVersion,input.hardwareProfile ?? null,hashToken(token),null,now,now);
    return { id: input.id, organizationId: input.organizationId, name: input.name, status: "offline" as const, agentVersion: input.agentVersion, token };
  }

  authenticateDevice(token: string) {
    if (!token) return null;
    const r = this.db.prepare("SELECT id,organization_id,name,status,agent_version FROM devices WHERE credential_hash=?").get(hashToken(token)) as Record<string, unknown> | undefined;
    return r ? { id:String(r.id), organizationId:String(r.organization_id), name:String(r.name), status:r.status as DeviceStatus, agentVersion:String(r.agent_version) } : null;
  }

  heartbeat(deviceId: string, input: { status: DeviceStatus; agentVersion: string; metrics?: Record<string, unknown>; cameraStates?: Array<Record<string, unknown>> }) {
    const now = new Date().toISOString();
    this.db.prepare("UPDATE devices SET status=?,agent_version=?,last_heartbeat_at=?,updated_at=? WHERE id=?").run(input.status,input.agentVersion,now,now,deviceId);
    return this.db.prepare("SELECT id,organization_id,name,status,agent_version,last_heartbeat_at FROM devices WHERE id=?").get(deviceId);
  }

  listDevices(orgId: string) {
    return this.db.prepare("SELECT id,name,status,agent_version,hardware_profile,last_heartbeat_at,created_at,updated_at FROM devices WHERE organization_id=? ORDER BY created_at").all(orgId);
  }

  enqueueDeviceCommand(input:{id:string;organizationId:string;deviceId:string;type:string;payload:Record<string,unknown>}) {
    const now=new Date().toISOString();
    this.db.prepare("INSERT INTO device_commands(id,organization_id,device_id,type,payload_json,status,created_at) VALUES (?,?,?,?,?,?,?)")
      .run(input.id,input.organizationId,input.deviceId,input.type,JSON.stringify(input.payload),"queued",now);
    return this.getDeviceCommand(input.id);
  }

  pullDeviceCommands(deviceId:string, limit=20) {
    const safeLimit=Math.max(1,Math.min(100,Math.trunc(limit)));
    const now=new Date().toISOString();
    const commands=this.db.prepare("SELECT * FROM device_commands WHERE device_id=? AND status='queued' ORDER BY created_at LIMIT ?").all(deviceId,safeLimit);
    if(commands.length) {
      const update=this.db.prepare("UPDATE device_commands SET status='delivered',delivered_at=? WHERE id=? AND status='queued'");
      for(const command of commands) update.run(now,String(command.id));
    }
    return commands.map(command=>({...command,status:"delivered",delivered_at:now}));
  }

  acknowledgeDeviceCommand(id:string, deviceId:string, success:boolean, errorMessage?:string|null) {
    const now=new Date().toISOString();
    const status=success?"acknowledged":"failed";
    this.db.prepare("UPDATE device_commands SET status=?,acknowledged_at=?,error_message=? WHERE id=? AND device_id=? AND status='delivered'")
      .run(status,now,errorMessage??null,id,deviceId);
    return this.getDeviceCommand(id);
  }

  getDeviceCommand(id:string) { return this.db.prepare("SELECT * FROM device_commands WHERE id=?").get(id); }

  createRecording(input: { id:string; organizationId:string; projectId?:string|null; cameraId?:string|null; status:"starting"|"recording"|"stopping"|"complete"|"failed"; startedAt:string; endedAt?:string|null; sourceRevision?:number }) {
    const now = new Date().toISOString();
    this.db.prepare("INSERT INTO recordings(id,organization_id,project_id,camera_id,status,started_at,ended_at,source_revision,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)")
      .run(input.id,input.organizationId,input.projectId??null,input.cameraId??null,input.status,input.startedAt,input.endedAt??null,input.sourceRevision??1,now,now);
    return this.getRecording(input.id);
  }

  getRecording(id:string) { return this.db.prepare("SELECT * FROM recordings WHERE id=?").get(id); }
  listRecordings(projectId:string) { return this.db.prepare("SELECT * FROM recordings WHERE project_id=? ORDER BY started_at DESC").all(projectId); }

  createSegment(input: { id:string; recordingId:string; sequence:number; startedAt:string; durationMs:number; localPath?:string|null; objectKey?:string|null; byteSize?:number|null; checksum?:string|null }) {
    const createdAt = new Date().toISOString();
    this.db.prepare("INSERT INTO recording_segments(id,recording_id,sequence,started_at,duration_ms,local_path,object_key,byte_size,checksum,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)")
      .run(input.id,input.recordingId,input.sequence,input.startedAt,input.durationMs,input.localPath??null,input.objectKey??null,input.byteSize??null,input.checksum??null,createdAt);
    return this.db.prepare("SELECT * FROM recording_segments WHERE id=?").get(input.id);
  }

  listSegments(recordingId:string) { return this.db.prepare("SELECT * FROM recording_segments WHERE recording_id=? ORDER BY sequence").all(recordingId); }
  getEvent(id:string) { return this.db.prepare("SELECT * FROM events WHERE id=?").get(id); }

  createEvent(input: { id:string; organizationId:string; projectId?:string|null; recordingId?:string|null; timestampMs:number; type:string; source:string; metadataJson:string }) {
    const createdAt = new Date().toISOString();
    this.db.prepare("INSERT INTO events(id,organization_id,project_id,recording_id,timestamp_ms,type,source,metadata_json,created_at) VALUES (?,?,?,?,?,?,?,?,?)")
      .run(input.id,input.organizationId,input.projectId??null,input.recordingId??null,input.timestampMs,input.type,input.source,input.metadataJson,createdAt);
    return { id:input.id, organizationId:input.organizationId, projectId:input.projectId??null, recordingId:input.recordingId??null, timestampMs:input.timestampMs, type:input.type, source:input.source, metadataJson:input.metadataJson, createdAt };
  }

  enqueueClip(input: { id:string; organizationId:string; projectId?:string|null; eventId:string; preSeconds:number; postSeconds:number; sourceRevision:number }) {
    const now = new Date().toISOString();
    this.db.exec("BEGIN");
    try {
      this.db.prepare("INSERT INTO clips(id,organization_id,project_id,event_id,status,pre_seconds,post_seconds,source_revision,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)")
        .run(input.id,input.organizationId,input.projectId??null,input.eventId,"queued",input.preSeconds,input.postSeconds,input.sourceRevision,now,now);
      this.db.prepare("INSERT INTO processing_jobs(id,organization_id,type,resource_id,status,attempts,available_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)")
        .run(randomBytes(16).toString("hex"),input.organizationId,"clip",input.id,"queued",0,now,now,now);
      this.db.exec("COMMIT");
    } catch (e) { try { this.db.exec("ROLLBACK"); } catch {} throw e; }
    return this.getClip(input.id);
  }

  getClip(id:string) { return this.db.prepare("SELECT * FROM clips WHERE id=?").get(id); }
  listClips(projectId:string) { return this.db.prepare("SELECT * FROM clips WHERE project_id=? ORDER BY created_at DESC").all(projectId); }
  listEvents(projectId:string) { return this.db.prepare("SELECT * FROM events WHERE project_id=? ORDER BY timestamp_ms DESC").all(projectId); }

  claimJob(workerId:string) {
    const now = new Date().toISOString();
    const job = this.db.prepare("SELECT * FROM processing_jobs WHERE status='queued' AND available_at<=? ORDER BY available_at,created_at LIMIT 1").get(now) as Record<string,unknown> | undefined;
    if (!job) return null;
    const changed = this.db.prepare("UPDATE processing_jobs SET status='running',attempts=attempts+1,started_at=?,updated_at=? WHERE id=? AND status='queued'").run(now,now,String(job.id));
    return Number(changed.changes) === 1 ? { ...job, status:"running", workerId } : null;
  }
}
