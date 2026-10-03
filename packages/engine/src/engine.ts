import type {
  EngineDiagnostic, EngineResult, Hardware, ModuleDefinition,
  ProjectDefinition, Rule,
} from "./types.js";

export const ENGINE_VERSION = "0.2.0";

export interface EngineCatalog {
  modules: ModuleDefinition[];
  hardware: Hardware[];
  rules: Rule[];
}

export function resolveProject(project: ProjectDefinition, catalog: EngineCatalog): EngineResult {
  const diagnostics: EngineDiagnostic[] = [];
  const moduleMap = indexUnique(catalog.modules, (m) => m.id, diagnostics, "DUPLICATE_MODULE");
  const hardwareMap = indexUnique(catalog.hardware, (h) => h.id, diagnostics, "DUPLICATE_HARDWARE");

  const requestedModules = unique(project.project.modules);
  const resolvedModules = new Set<string>();
  const dependencyModules = new Set<string>();
  const queue = [...requestedModules];

  while (queue.length > 0) {
    const moduleId = queue.shift()!;
    if (resolvedModules.has(moduleId)) continue;
    const module = moduleMap.get(moduleId);
    if (!module) {
      diagnostics.push({ code: "MODULE_NOT_FOUND", severity: "error", message: `Module "${moduleId}" is not present in the catalog.`, source: moduleId });
      continue;
    }
    resolvedModules.add(moduleId);
    for (const dependency of unique(module.requires ?? [])) {
      if (!resolvedModules.has(dependency)) {
        dependencyModules.add(dependency);
        queue.push(dependency);
      }
    }
  }

  const appliedRules = new Set<string>();
  for (const rule of catalog.rules) {
    if (!rule.when.module || !resolvedModules.has(rule.when.module)) continue;
    appliedRules.add(rule.id);

    for (const requiredModule of rule.then.requiresModules ?? []) {
      if (!resolvedModules.has(requiredModule)) {
        diagnostics.push({ code: "RULE_MODULE_REQUIRED", severity: rule.severity, message: rule.message, source: rule.id });
      }
    }

    if (rule.then.requiresHardwareCategory &&
        !catalog.hardware.some((h) => h.category === rule.then.requiresHardwareCategory)) {
      diagnostics.push({ code: "RULE_HARDWARE_UNAVAILABLE", severity: rule.severity, message: rule.message, source: rule.id });
    }

    if (rule.then.requiresCapability &&
        !catalog.hardware.some((h) => hasCapability(h, rule.then.requiresCapability!.key, rule.then.requiresCapability!.value))) {
      diagnostics.push({ code: "RULE_CAPABILITY_UNAVAILABLE", severity: rule.severity, message: rule.message, source: rule.id });
    }
  }

  const selectedHardware = project.project.hardware ?? [];
  const bom = [];
  for (const selection of selectedHardware) {
    if (!hardwareMap.has(selection.id)) {
      diagnostics.push({ code: "HARDWARE_NOT_FOUND", severity: "error", message: `Hardware "${selection.id}" is not present in the catalog.`, source: selection.id });
      continue;
    }
    if (selection.quantity <= 0 || !Number.isInteger(selection.quantity)) {
      diagnostics.push({ code: "INVALID_HARDWARE_QUANTITY", severity: "error", message: `Hardware "${selection.id}" must have a positive integer quantity.`, source: selection.id });
      continue;
    }
    bom.push({ hardwareId: selection.id, quantity: selection.quantity, source: { type: "project" as const } });
  }

  const compatibleHardware = catalog.hardware
    .filter((hardware) => selectedHardware.length === 0 || selectedHardware.some((s) => s.id === hardware.id))
    .map((hardware) => hardware.id)
    .sort();

  const diagnosticsSorted = diagnostics.sort((a, b) =>
    a.severity.localeCompare(b.severity) || a.code.localeCompare(b.code) || (a.source ?? "").localeCompare(b.source ?? ""),
  );

  return {
    valid: !diagnosticsSorted.some((d) => d.severity === "error"),
    engineVersion: ENGINE_VERSION,
    modules: [...resolvedModules].sort(),
    compatibleHardware,
    dependencies: [...dependencyModules].sort(),
    appliedRules: [...appliedRules].sort(),
    bom: bom.sort((a, b) => a.hardwareId.localeCompare(b.hardwareId)),
    diagnostics: diagnosticsSorted,
  };
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function indexUnique<T>(items: T[], key: (item: T) => string, diagnostics: EngineDiagnostic[], code: string): Map<string, T> {
  const result = new Map<string, T>();
  for (const item of items) {
    const id = key(item);
    if (result.has(id)) {
      diagnostics.push({ code, severity: "error", message: `Catalog contains duplicate identifier "${id}".`, source: id });
      continue;
    }
    result.set(id, item);
  }
  return result;
}

function hasCapability(hardware: Hardware, key: string, expected?: unknown): boolean {
  if (!(key in hardware.capabilities)) return false;
  return expected === undefined || Object.is(hardware.capabilities[key], expected);
}
