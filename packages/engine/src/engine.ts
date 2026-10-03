import type {
  EngineDiagnostic, EngineResult, Hardware, ModuleDefinition,
  ProjectDefinition, Rule,
} from "./types.js";

export const ENGINE_VERSION = "0.3.0";

export interface EngineCatalog {
  modules: ModuleDefinition[];
  hardware: Hardware[];
  rules: Rule[];
}

const severityRank: Record<EngineDiagnostic["severity"], number> = {
  error: 0,
  warning: 1,
  info: 2,
};

export function resolveProject(project: ProjectDefinition, catalog: EngineCatalog): EngineResult {
  const diagnostics: EngineDiagnostic[] = [];
  const moduleMap = indexUnique(catalog.modules, (m) => m.id, diagnostics, "DUPLICATE_MODULE");
  const hardwareMap = indexUnique(catalog.hardware, (h) => h.id, diagnostics, "DUPLICATE_HARDWARE");
  validateCatalogReferences(catalog, moduleMap, hardwareMap, diagnostics);

  const requestedModules = unique(project.project.modules);
  const resolvedModules = new Set<string>();
  const dependencyModules = new Set<string>();
  const visiting = new Set<string>();

  const resolveModule = (moduleId: string, isRequested: boolean) => {
    if (resolvedModules.has(moduleId)) {
      if (!isRequested) dependencyModules.add(moduleId);
      return;
    }
    const module = moduleMap.get(moduleId);
    if (!module) {
      diagnostics.push({
        code: "MODULE_NOT_FOUND",
        severity: "error",
        message: `Module "${moduleId}" is not present in the catalog.`,
        source: moduleId,
      });
      return;
    }
    if (visiting.has(moduleId)) {
      diagnostics.push({
        code: "MODULE_DEPENDENCY_CYCLE",
        severity: "error",
        message: `Module dependency cycle detected at "${moduleId}".`,
        source: moduleId,
      });
      return;
    }

    visiting.add(moduleId);
    for (const dependency of unique(module.requires ?? [])) {
      if (!requestedModules.includes(dependency)) dependencyModules.add(dependency);
      resolveModule(dependency, false);
    }
    visiting.delete(moduleId);
    resolvedModules.add(moduleId);
  };

  for (const moduleId of requestedModules) resolveModule(moduleId, true);

  const activeRules = catalog.rules
    .filter((rule) => !rule.when.module || resolvedModules.has(rule.when.module))
    .sort((a, b) => a.id.localeCompare(b.id));

  for (const rule of activeRules) {
    for (const requiredModule of unique(rule.then.requiresModules ?? [])) {
      if (!resolvedModules.has(requiredModule)) {
        diagnostics.push({
          code: "RULE_MODULE_REQUIRED",
          severity: rule.severity,
          message: rule.message,
          source: rule.id,
        });
      }
    }
  }

  const selectedHardware = project.project.hardware ?? [];
  const hardwareConstraints = activeRules
    .map((rule) => ({
      rule,
      category: rule.then.requiresHardwareCategory,
      capability: rule.then.requiresCapability,
    }))
    .filter((entry) => entry.category || entry.capability);

  for (const selection of selectedHardware) {
    const hardware = hardwareMap.get(selection.id);
    if (!hardware) {
      diagnostics.push({
        code: "HARDWARE_NOT_FOUND",
        severity: "error",
        message: `Hardware "${selection.id}" is not present in the catalog.`,
        source: selection.id,
      });
      continue;
    }
    if (!Number.isInteger(selection.quantity) || selection.quantity <= 0) {
      diagnostics.push({
        code: "INVALID_HARDWARE_QUANTITY",
        severity: "error",
        message: `Hardware "${selection.id}" must have a positive integer quantity.`,
        source: selection.id,
      });
      continue;
    }

    for (const constraint of hardwareConstraints) {
      if (constraint.category && hardware.category !== constraint.category) {
        diagnostics.push({
          code: "HARDWARE_CATEGORY_INCOMPATIBLE",
          severity: constraint.rule.severity,
          message: `Hardware "${selection.id}" does not satisfy category "${constraint.category}".`,
          source: constraint.rule.id,
        });
      }
      if (constraint.capability &&
          !hasCapability(hardware, constraint.capability.key, constraint.capability.value)) {
        diagnostics.push({
          code: "HARDWARE_CAPABILITY_INCOMPATIBLE",
          severity: constraint.rule.severity,
          message: `Hardware "${selection.id}" does not satisfy capability "${constraint.capability.key}".`,
          source: constraint.rule.id,
        });
      }
    }
  }

  for (const constraint of hardwareConstraints) {
    const candidates = catalog.hardware.filter((hardware) => {
      const categoryOk = !constraint.category || hardware.category === constraint.category;
      const capabilityOk = !constraint.capability ||
        hasCapability(hardware, constraint.capability.key, constraint.capability.value);
      return categoryOk && capabilityOk;
    });
    if (candidates.length === 0) {
      diagnostics.push({
        code: "RULE_HARDWARE_UNAVAILABLE",
        severity: constraint.rule.severity,
        message: constraint.rule.message,
        source: constraint.rule.id,
      });
    }
  }

  const compatibleHardware = (selectedHardware.length > 0
    ? selectedHardware.map((selection) => hardwareMap.get(selection.id)).filter((hardware): hardware is Hardware => Boolean(hardware))
    : catalog.hardware
  )
    .filter((hardware) => hardwareConstraints.every((constraint) =>
      (!constraint.category || hardware.category === constraint.category) &&
      (!constraint.capability || hasCapability(hardware, constraint.capability.key, constraint.capability.value)),
    ))
    .map((hardware) => hardware.id)
    .sort();

  const bomMap = new Map<string, number>();
  for (const selection of selectedHardware) {
    if (!hardwareMap.has(selection.id) || !Number.isInteger(selection.quantity) || selection.quantity <= 0) continue;
    bomMap.set(selection.id, (bomMap.get(selection.id) ?? 0) + selection.quantity);
  }

  const bom = [...bomMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([hardwareId, quantity]) => ({
      hardwareId,
      quantity,
      source: { type: "project" as const },
    }));

  const diagnosticsSorted = diagnostics.sort((a, b) =>
    severityRank[a.severity] - severityRank[b.severity] ||
    a.code.localeCompare(b.code) ||
    (a.source ?? "").localeCompare(b.source ?? "") ||
    a.message.localeCompare(b.message),
  );

  return {
    valid: !diagnosticsSorted.some((d) => d.severity === "error"),
    engineVersion: ENGINE_VERSION,
    modules: [...resolvedModules].sort(),
    compatibleHardware,
    dependencies: [...dependencyModules].filter((id) => !requestedModules.includes(id)).sort(),
    appliedRules: activeRules.map((rule) => rule.id),
    bom,
    diagnostics: diagnosticsSorted,
  };
}

function validateCatalogReferences(
  catalog: EngineCatalog,
  moduleMap: Map<string, ModuleDefinition>,
  hardwareMap: Map<string, Hardware>,
  diagnostics: EngineDiagnostic[],
) {
  for (const module of catalog.modules) {
    for (const dependency of unique(module.requires ?? [])) {
      if (!moduleMap.has(dependency)) {
        diagnostics.push({
          code: "MODULE_DEPENDENCY_NOT_FOUND",
          severity: "error",
          message: `Module "${module.id}" requires missing module "${dependency}".`,
          source: module.id,
        });
      }
    }
  }

  const ruleIds = new Set<string>();
  for (const rule of catalog.rules) {
    if (ruleIds.has(rule.id)) {
      diagnostics.push({
        code: "DUPLICATE_RULE",
        severity: "error",
        message: `Catalog contains duplicate rule identifier "${rule.id}".`,
        source: rule.id,
      });
    }
    ruleIds.add(rule.id);

    if (rule.when.module && !moduleMap.has(rule.when.module)) {
      diagnostics.push({
        code: "RULE_MODULE_NOT_FOUND",
        severity: "error",
        message: `Rule "${rule.id}" references missing module "${rule.when.module}".`,
        source: rule.id,
      });
    }
  }

  for (const hardware of catalog.hardware) {
    if (!hardware.id || !hardware.category) {
      diagnostics.push({
        code: "INVALID_HARDWARE_DEFINITION",
        severity: "error",
        message: "Hardware catalog entries require id and category.",
        source: hardware.id,
      });
    }
  }

  void hardwareMap;
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function indexUnique<T>(
  items: T[],
  key: (item: T) => string,
  diagnostics: EngineDiagnostic[],
  code: string,
): Map<string, T> {
  const result = new Map<string, T>();
  for (const item of items) {
    const id = key(item);
    if (result.has(id)) {
      diagnostics.push({
        code,
        severity: "error",
        message: `Catalog contains duplicate identifier "${id}".`,
        source: id,
      });
      continue;
    }
    result.set(id, item);
  }
  return result;
}

function hasCapability(hardware: Hardware, key: string, expected?: unknown): boolean {
  if (!(key in hardware.capabilities)) return false;
  return expected === undefined || deepEqual(hardware.capabilities[key], expected);
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== typeof b || a === null || b === null) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((value, index) => deepEqual(value, b[index]));
  }
  if (typeof a === "object" && typeof b === "object") {
    const left = a as Record<string, unknown>;
    const right = b as Record<string, unknown>;
    const keys = Object.keys(left);
    return keys.length === Object.keys(right).length &&
      keys.every((key) => key in right && deepEqual(left[key], right[key]));
  }
  return false;
}
