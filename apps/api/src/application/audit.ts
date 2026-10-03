import type { AuditEvent } from "../../../../packages/domain/src/business.js";
import type { BusinessRepository } from "../../../../packages/persistence/src/business.js";

export function writeAudit(
  repository: BusinessRepository,
  input: Omit<AuditEvent, "id" | "createdAt">,
): AuditEvent {
  const event: AuditEvent = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  return repository.audit(event);
}
