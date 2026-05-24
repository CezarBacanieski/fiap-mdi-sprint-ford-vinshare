import { AppRole, Permission } from "./types";

const rolePermissions: Record<AppRole, Set<Permission>> = {
  admin: new Set<Permission>([
    "vehicle:view",
    "vehicle:create",
    "vehicle:delete",
    "service:create",
    "service:view",
    "profile:update",
    "rewards:redeem",
    "security:admin",
  ]),
  analyst: new Set<Permission>([
    "vehicle:view",
    "vehicle:create",
    "service:create",
    "service:view",
    "profile:update",
    "rewards:redeem",
  ]),
  user: new Set<Permission>([
    "vehicle:view",
    "vehicle:create",
    "service:create",
    "service:view",
    "profile:update",
    "rewards:redeem",
  ]),
};

export const hasPermission = (role: AppRole, permission: Permission): boolean => {
  return rolePermissions[role].has(permission);
};

export const assertPermission = (
  role: AppRole,
  permission: Permission,
  message = "Você não tem permissão para esta ação.",
): void => {
  if (!hasPermission(role, permission)) {
    throw new Error(message);
  }
};
