import { z } from "zod";

export const HardwareSchema = z.object({
  id: z.string().min(1),
  category: z.string().min(1),
  model: z.string().min(1),
  capabilities: z.record(z.unknown()),
  compatibility: z.record(z.unknown()).optional(),
});
export const ModuleSchema = z.object({
  id: z.string().min(1), version: z.string().min(1),
  requires: z.array(z.string().min(1)).optional(),
  provides: z.array(z.string().min(1)).optional(),
});
export const RuleSchema = z.object({
  id: z.string().min(1),
  when: z.object({ module: z.string().min(1).optional() }),
  then: z.object({
    requiresHardwareCategory: z.string().min(1).optional(),
    requiresModules: z.array(z.string().min(1)).optional(),
    requiresCapability: z.object({ key: z.string().min(1), value: z.unknown().optional() }).optional(),
  }),
  severity: z.enum(["error", "warning", "info"]),
  message: z.string().min(1),
});
export const ModuleCatalogSchema = z.object({ catalog_version: z.string().min(1), modules: z.array(ModuleSchema) });
export const RuleCatalogSchema = z.object({ catalog_version: z.string().min(1), rules: z.array(RuleSchema) });
export const HardwareCatalogSchema = z.object({ catalog_version: z.string().min(1), items: z.array(HardwareSchema) });
