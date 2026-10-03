export type ProjectStatus = "draft" | "quoted" | "contracted" | "installing" | "operational" | "archived";
export type ContractStatus = "draft" | "sent" | "accepted" | "active" | "cancelled" | "expired";
export type InstallationStatus = "planned" | "scheduled" | "in_progress" | "installed" | "blocked" | "cancelled";
export type MemberRole = "owner" | "admin" | "manager" | "operator" | "viewer";

export interface Organization { id: string; name: string; slug: string; createdAt: string; updatedAt: string; }
export interface Member { id: string; organizationId: string; email: string; displayName: string; role: MemberRole; createdAt: string; updatedAt: string; }
export interface BusinessProject { id: string; organizationId: string; name: string; sport: string; status: ProjectStatus; currentConfigurationId: string | null; createdAt: string; updatedAt: string; }
export interface ProjectConfiguration { id: string; projectId: string; version: number; definitionJson: string; engineVersion: string | null; resolutionJson: string | null; createdAt: string; createdBy: string; }
export interface Contract { id: string; projectId: string; number: string; status: ContractStatus; currency: string; totalCents: number; validUntil: string | null; createdAt: string; updatedAt: string; }
export interface Installation { id: string; projectId: string; status: InstallationStatus; scheduledAt: string | null; completedAt: string | null; notes: string | null; createdAt: string; updatedAt: string; }
export interface InstalledHardware { id: string; projectId: string; installationId: string | null; catalogHardwareId: string; serialNumber: string | null; quantity: number; status: "planned" | "installed" | "maintenance" | "retired"; createdAt: string; updatedAt: string; }
export interface AuditEvent { id: string; organizationId: string; actorMemberId: string | null; action: string; resourceType: string; resourceId: string; metadataJson: string; createdAt: string; }
