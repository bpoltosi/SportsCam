import type { AuthUser } from "../../../../packages/auth/src/auth.js";
import type { MemberRole } from "../../../../packages/domain/src/business.js";
import { AppError } from "./errors.js";

const hierarchy: Record<MemberRole, number> = {
  viewer: 10,
  operator: 20,
  manager: 30,
  admin: 40,
  owner: 50,
};

export function assertRole(user: AuthUser | null | undefined, roles: readonly MemberRole[]): void {
  if (!user || !roles.includes(user.role as MemberRole)) {
    throw new AppError("FORBIDDEN", 403);
  }
}

export function assertAtLeastRole(user: AuthUser | null | undefined, role: MemberRole): void {
  const current = user?.role as MemberRole | undefined;
  if (!current || hierarchy[current] < hierarchy[role]) {
    throw new AppError("FORBIDDEN", 403);
  }
}
