export type Severity = "error" | "warning" | "info";

export interface ProjectDefinition {
  project: {
    id: string;
    version: string;
    sport: string;
    modules: string[];
    hardware?: Array<{ id: string; quantity: number }>;
    profile?: string;
  };
}

export interface Hardware {
  id: string;
  category: string;
  model: string;
  capabilities: Record<string, unknown>;
  compatibility?: Record<string, unknown>;
}

export interface ModuleDefinition {
  id: string;
  version: string;
  requires?: string[];
  provides?: string[];
}

export interface Rule {
  id: string;
  when: { module?: string };
  then: {
    requiresHardwareCategory?: string;
    requiresModules?: string[];
  };
  severity: Severity;
  message: string;
}

export interface BomItem {
  hardwareId: string;
  quantity: number;
  source: { type: "project" | "module_dependency"; module?: string };
}

export interface EngineDiagnostic {
  code: string;
  severity: Severity;
  message: string;
  source?: string;
}

export interface EngineResult {
  valid: boolean;
  engineVersion: string;
  modules: string[];
  compatibleHardware: string[];
  dependencies: string[];
  appliedRules: string[];
  bom: BomItem[];
  diagnostics: EngineDiagnostic[];
}
