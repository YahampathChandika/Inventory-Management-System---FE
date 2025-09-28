// Permission system with type safety and centralized configuration

export type Role = "Admin" | "Manager" | "Viewer";
export type Permission = keyof typeof PERMISSIONS;

// Centralized permission configuration
export const PERMISSIONS = {
  // Dashboard access
  "dashboard.view": { roles: ["Viewer", "Manager", "Admin"] as Role[] },

  // Inventory permissions
  "inventory.view": { roles: ["Viewer", "Manager", "Admin"] as Role[] },
  "inventory.create": { roles: ["Manager", "Admin"] as Role[] },
  "inventory.edit": { roles: ["Manager", "Admin"] as Role[] },
  "inventory.delete": { roles: ["Manager", "Admin"] as Role[] },
  "inventory.quantity.update": { roles: ["Manager", "Admin"] as Role[] },

  // User management permissions
  "users.view": { roles: ["Admin"] as Role[] },
  "users.create": { roles: ["Admin"] as Role[] },
  "users.edit": { roles: ["Admin"] as Role[] },
  "users.delete": { roles: ["Admin"] as Role[] },
  "users.status.update": { roles: ["Admin"] as Role[] },

  // Merchant permissions
  "merchants.view": { roles: ["Manager", "Admin"] as Role[] },
  "merchants.create": { roles: ["Manager", "Admin"] as Role[] },
  "merchants.edit": { roles: ["Manager", "Admin"] as Role[] },
  "merchants.delete": { roles: ["Manager", "Admin"] as Role[] },
  "merchants.import": { roles: ["Manager", "Admin"] as Role[] },

  // Report permissions
  "reports.view": { roles: ["Manager", "Admin"] as Role[] },
  "reports.send": { roles: ["Manager", "Admin"] as Role[] },
  "reports.history": { roles: ["Manager", "Admin"] as Role[] },

  // Profile permissions
  "profile.view": { roles: ["Viewer", "Manager", "Admin"] as Role[] },
  "profile.edit": { roles: ["Viewer", "Manager", "Admin"] as Role[] },
  "profile.password.change": {
    roles: ["Viewer", "Manager", "Admin"] as Role[],
  },
} as const;

// Route-to-permission mapping
export const ROUTE_PERMISSIONS = {
  "/dashboard": ["dashboard.view"],
  "/dashboard/inventory": ["inventory.view"],
  "/dashboard/inventory/new": ["inventory.create"],
  "/dashboard/inventory/[id]/edit": ["inventory.edit"],
  "/dashboard/users": ["users.view"],
  "/dashboard/users/new": ["users.create"],
  "/dashboard/users/[id]/edit": ["users.edit"],
  "/dashboard/merchants": ["merchants.view"],
  "/dashboard/merchants/new": ["merchants.create"],
  "/dashboard/reports": ["reports.view"],
  "/dashboard/profile": ["profile.view"],
} as const;

// Role hierarchy for easier checking
const ROLE_HIERARCHY: Record<Role, number> = {
  Viewer: 1,
  Manager: 2,
  Admin: 3,
};

// Permission checking functions
export class PermissionChecker {
  private userRole: Role;

  constructor(userRole: Role) {
    this.userRole = userRole;
  }

  // Check if user has specific permission
  hasPermission(permission: Permission): boolean {
    const permissionConfig = PERMISSIONS[permission];
    return permissionConfig.roles.includes(this.userRole);
  }

  // Check if user has any of the provided permissions
  hasAnyPermission(permissions: Permission[]): boolean {
    return permissions.some((permission) => this.hasPermission(permission));
  }

  // Check if user has all of the provided permissions
  hasAllPermissions(permissions: Permission[]): boolean {
    return permissions.every((permission) => this.hasPermission(permission));
  }

  // Check if user has minimum role level
  hasMinimumRole(minimumRole: Role): boolean {
    return ROLE_HIERARCHY[this.userRole] >= ROLE_HIERARCHY[minimumRole];
  }

  // Get all permissions for user's role
  getUserPermissions(): Permission[] {
    return Object.entries(PERMISSIONS)
      .filter(([_, config]) => config.roles.includes(this.userRole))
      .map(([permission]) => permission as Permission);
  }

  // Check route access
  canAccessRoute(route: string): boolean {
    const requiredPermissions =
      ROUTE_PERMISSIONS[route as keyof typeof ROUTE_PERMISSIONS];
    if (!requiredPermissions) return true; // No specific permissions required

    return this.hasAnyPermission([...requiredPermissions]);
  }
}

// Helper functions for React components
export function createPermissionChecker(
  userRole: Role | undefined
): PermissionChecker | null {
  if (!userRole) return null;
  return new PermissionChecker(userRole);
}

export function hasPermission(
  userRole: Role | undefined,
  permission: Permission
): boolean {
  const checker = createPermissionChecker(userRole);
  return checker ? checker.hasPermission(permission) : false;
}

export function hasMinimumRole(
  userRole: Role | undefined,
  minimumRole: Role
): boolean {
  if (!userRole) return false;
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minimumRole];
}

// Permission debugging (development only)
export function debugPermissions(userRole: Role) {
  if (process.env.NODE_ENV !== "development") return;

  const checker = new PermissionChecker(userRole);
  console.group(`🔐 Permissions for role: ${userRole}`);
  console.log("All permissions:", checker.getUserPermissions());
  console.log("Role level:", ROLE_HIERARCHY[userRole]);
  console.groupEnd();
}
