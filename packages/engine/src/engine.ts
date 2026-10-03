import type {
  EngineDiagnostic,
  EngineResult,
  Hardware,
  ModuleDefinition,
  ProjectDefinition,
  Rule,
} from "./types.js";

export const ENGINE_VERSION = "0.1.0";

export interface EngineCatalog {
  modules: ModuleDefinition[];
  hardware: Hardware[];
  rules: Rule[];
}

export function resolveProject(
  project: ProjectDefinition,
  catalog: EngineCatalog,
): EngineResult {
  const diagnostics: EngineDiagnostic[] = [];
  const moduleMap = new Map(catalog.modules.map((m) => [m.id, m]));
  const hardwareMap = new Map(catalog.hardware.map((h) => [h.id, h]));

  const requestedModules = [...new Set(project.project.modules)].sort();
  const resolvedModules = new Set<string>();
  const queue = [...requestedModules];
  const dependencies: string[] = [];

  while (queue.length) {
    const moduleId = queue.shift()!;
    if (resolvedModules.has(moduleId)) continue;

    const module = moduleMap.get(moduleId);
    if (!module) {
      diagnostics.push({
        code: "MODULE_NOT_FOUND",
        severity: "error",
        message: `Module "${moduleId}" is not present in the catalog.`,
        source: moduleId,
      });
      continue;
    }

    resolvedModules.add(moduleId);
    for (const dependency of module.requires ?? []) {
      if (!resolvedModules.has(dependency)) {
        dependencies.push(dependency);
        queue.push(dependency);
      }
    }
  }

  const appliedRules: string[] = [];
  for (const rule of catalog.rules) {
    if (rule.when.module && resolvedModules.has(rule.when.module)) {
      appliedRules.push(rule.id);
      for (const requiredModule of rule.then.requiresModules ?? []) {
        if (!resolvedModules.has(requiredModule)) {
          diagnostics.push({
            code: "RULE_MODULE_REQUIRED",
            severity: rule.severity,
            message: rule.message,
            source: rule.id,
          });
        }
      }

      if (rule.then.requiresHardwareCategory) {
        const hasCategory = catalog.hardware.some(
          (h) => h.category === rule.then.requiresHardwareCategory,
        );
        if (!hasCategory) {
          diagnostics.push({
            code: "RULE_HARDWARE_UNAVAILABLE",
            severity: rule.severity,
            message: rule.message,
            source: rule.id,
          });
        }
      }
    }
  }

  const compatibleHardware = catalog.hardware
    .filter((hardware) => isHardwareCompatible(hardware, project))
    .map((hardware) => hardware.id)
    .sort();

  const bom = (project.project.hardware ?? [])
    .map(({ id, quantity }) => {
      if (!hardwareMap.has(id)) {
        diagnostics.push({
          code: "HARDWARE_NOT_FOUND",
          severity: "error",
          message: `Hardware "${id}" is not present in the catalog.`,
          source: id,
        });
        return null;
      }
      return {
        hardwareId: id,
        quantity,
        source: { type: "project" as const },
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return {
    valid: !diagnostics.some((d) => d.severity === "error"),
    engineVersion: ENGINE_VERSION,
    modules: [...resolvedModules].sort(),
    compatibleHardware,
    dependencies: [...new Set(dependencies)].sort(),
    appliedRules: appliedRules.sort(),
    bom,
    diagnostics,
  };
}

function isHardwareCompatible(
  hardware: Hardware,
  project: ProjectDefinition,
): boolean {
  if (!project.project.hardware?.length) return true;
  return project.project.hardware.some((selection) => selection.id === hardware.id);
}
