import type { BusinessRepository } from "../../../../packages/persistence/src/business.js";
import type {
  BusinessProject,
  Contract,
  Installation,
  ProjectConfiguration,
} from "../../../../packages/domain/src/business.js";
import { writeAudit } from "./audit.js";
import { AppError } from "./errors.js";

export class BusinessService {
  constructor(private readonly repository: BusinessRepository) {}

  createProject(project: BusinessProject, actorMemberId: string): BusinessProject {
    try {
      return this.repository.transaction(() => {
      const created = this.repository.createProject(project);
      writeAudit(this.repository, {
        organizationId: project.organizationId,
        actorMemberId,
        action: "project.created",
        resourceType: "business_project",
        resourceId: project.id,
        metadataJson: JSON.stringify({ status: project.status }),
      });
      return created;
      });
    } catch (error) {
      throw new AppError("CONFLICT", 409, error instanceof Error ? error.message : "PROJECT_CREATE_FAILED");
    }
  }

  createConfiguration(configuration: ProjectConfiguration, actorMemberId: string): ProjectConfiguration {
    try {
      return this.repository.transaction(() => {
      const created = this.repository.createConfiguration(configuration);
      writeAudit(this.repository, {
        organizationId: this.requireProjectOrganization(configuration.projectId),
        actorMemberId,
        action: "project.configuration.created",
        resourceType: "project_configuration",
        resourceId: configuration.id,
        metadataJson: JSON.stringify({ version: configuration.version, engineVersion: configuration.engineVersion }),
      });
      return created;
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("UNIQUE")) {
        throw new AppError("CONFLICT", 409, "CONFIGURATION_VERSION_CONFLICT");
      }
      throw error;
    }
  }

  createContract(contract: Contract, actorMemberId: string): Contract {
    const project = this.repository.getProject(contract.projectId);
    if (!project) throw new AppError("NOT_FOUND", 404, "BUSINESS_PROJECT_NOT_FOUND");
    try {
      const created = this.repository.transaction(() => { const value = this.repository.createContract(contract);
      writeAudit(this.repository, {
        organizationId: project.organizationId,
        actorMemberId,
        action: "contract.created",
        resourceType: "contract",
        resourceId: contract.id,
        metadataJson: JSON.stringify({ number: contract.number, totalCents: contract.totalCents }),
      }); return value; });
      return created;
    } catch (error) {
      if (error instanceof Error && error.message.includes("UNIQUE")) {
        throw new AppError("CONFLICT", 409, "CONTRACT_ALREADY_EXISTS");
      }
      throw error;
    }
  }

  createInstallation(installation: Installation, actorMemberId: string): Installation {
    const project = this.repository.getProject(installation.projectId);
    if (!project) throw new AppError("NOT_FOUND", 404, "BUSINESS_PROJECT_NOT_FOUND");
    const created = this.repository.createInstallation(installation);
    writeAudit(this.repository, {
      organizationId: project.organizationId,
      actorMemberId,
      action: "installation.created",
      resourceType: "installation",
      resourceId: installation.id,
      metadataJson: JSON.stringify({ status: installation.status }),
    });
    return created;
  }

  private requireProjectOrganization(projectId: string): string {
    const project = this.repository.getProject(projectId);
    if (!project) throw new AppError("NOT_FOUND", 404, "BUSINESS_PROJECT_NOT_FOUND");
    return project.organizationId;
  }
}
