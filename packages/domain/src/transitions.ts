import type { ContractStatus, InstallationStatus, ProjectStatus } from "./business.js";

const projectTransitions: Record<ProjectStatus, readonly ProjectStatus[]> = {
  draft: ["quoted", "archived"],
  quoted: ["draft", "contracted", "archived"],
  contracted: ["installing", "archived"],
  installing: ["operational", "blocked", "archived"],
  operational: ["archived"],
  archived: [],
};

const contractTransitions: Record<ContractStatus, readonly ContractStatus[]> = {
  draft: ["sent", "cancelled"],
  sent: ["accepted", "cancelled", "expired"],
  accepted: ["active", "cancelled"],
  active: ["cancelled", "expired"],
  cancelled: [],
  expired: [],
};

const installationTransitions: Record<InstallationStatus, readonly InstallationStatus[]> = {
  planned: ["scheduled", "cancelled"],
  scheduled: ["in_progress", "cancelled"],
  in_progress: ["installed", "blocked", "cancelled"],
  installed: ["blocked"],
  blocked: ["scheduled", "in_progress", "cancelled"],
  cancelled: [],
};

export function canTransitionProject(from: ProjectStatus, to: ProjectStatus): boolean {
  return projectTransitions[from].includes(to);
}

export function canTransitionContract(from: ContractStatus, to: ContractStatus): boolean {
  return contractTransitions[from].includes(to);
}

export function canTransitionInstallation(from: InstallationStatus, to: InstallationStatus): boolean {
  return installationTransitions[from].includes(to);
}

export function transitionProject(from: ProjectStatus, to: ProjectStatus): ProjectStatus {
  if (!canTransitionProject(from, to)) throw new Error("INVALID_PROJECT_STATUS_TRANSITION");
  return to;
}

export function transitionContract(from: ContractStatus, to: ContractStatus): ContractStatus {
  if (!canTransitionContract(from, to)) throw new Error("INVALID_CONTRACT_STATUS_TRANSITION");
  return to;
}

export function transitionInstallation(from: InstallationStatus, to: InstallationStatus): InstallationStatus {
  if (!canTransitionInstallation(from, to)) throw new Error("INVALID_INSTALLATION_STATUS_TRANSITION");
  return to;
}
