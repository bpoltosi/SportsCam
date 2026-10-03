import { describe, expect, it } from "vitest";
import {
  canTransitionContract,
  canTransitionInstallation,
  canTransitionProject,
  transitionProject,
} from "../packages/domain/src/transitions.js";

describe("business status transitions", () => {
  it("allows the normal project lifecycle", () => {
    expect(canTransitionProject("draft", "quoted")).toBe(true);
    expect(canTransitionProject("quoted", "contracted")).toBe(true);
    expect(canTransitionProject("contracted", "installing")).toBe(true);
    expect(canTransitionProject("installing", "operational")).toBe(true);
  });

  it("rejects skipping project lifecycle states", () => {
    expect(canTransitionProject("draft", "operational")).toBe(false);
    expect(() => transitionProject("draft", "operational")).toThrow("INVALID_PROJECT_STATUS_TRANSITION");
  });

  it("keeps terminal states terminal", () => {
    expect(canTransitionContract("cancelled", "active")).toBe(false);
    expect(canTransitionInstallation("cancelled", "planned")).toBe(false);
  });
});
