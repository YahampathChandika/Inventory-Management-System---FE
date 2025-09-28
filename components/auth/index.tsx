import React from "react";
import { useAuthStore } from "@/lib/store/auth";
import {
  PermissionChecker,
  Permission,
  Role,
  createPermissionChecker,
} from "@/lib/permissions";
import { AlertTriangle, Shield, Lock } from "lucide-react";

// Base interface for authorization components
interface BaseAuthProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showFallback?: boolean;
}

// Permission-based authorization
interface CanAccessProps extends BaseAuthProps {
  permission: Permission;
}

export function CanAccess({
  permission,
  children,
  fallback,
  showFallback = false,
}: CanAccessProps) {
  const { user } = useAuthStore();
  const checker = createPermissionChecker(user?.role.name as Role);

  if (!checker || !checker.hasPermission(permission)) {
    if (showFallback && fallback) return <>{fallback}</>;
    if (showFallback) return <PermissionDenied permission={permission} />;
    return null;
  }

  return <>{children}</>;
}

// Multiple permissions (any)
interface CanAccessAnyProps extends BaseAuthProps {
  permissions: Permission[];
}

export function CanAccessAny({
  permissions,
  children,
  fallback,
  showFallback = false,
}: CanAccessAnyProps) {
  const { user } = useAuthStore();
  const checker = createPermissionChecker(user?.role.name as Role);

  if (!checker || !checker.hasAnyPermission(permissions)) {
    if (showFallback && fallback) return <>{fallback}</>;
    if (showFallback) return <PermissionDenied permissions={permissions} />;
    return null;
  }

  return <>{children}</>;
}

// Multiple permissions (all)
interface CanAccessAllProps extends BaseAuthProps {
  permissions: Permission[];
}

export function CanAccessAll({
  permissions,
  children,
  fallback,
  showFallback = false,
}: CanAccessAllProps) {
  const { user } = useAuthStore();
  const checker = createPermissionChecker(user?.role.name as Role);

  if (!checker || !checker.hasAllPermissions(permissions)) {
    if (showFallback && fallback) return <>{fallback}</>;
    if (showFallback) return <PermissionDenied permissions={permissions} />;
    return null;
  }

  return <>{children}</>;
}

// Role-based authorization
interface RequireRoleProps extends BaseAuthProps {
  role: Role;
}

export function RequireRole({
  role,
  children,
  fallback,
  showFallback = false,
}: RequireRoleProps) {
  const { user } = useAuthStore();
  const checker = createPermissionChecker(user?.role.name as Role);

  if (!checker || !checker.hasMinimumRole(role)) {
    if (showFallback && fallback) return <>{fallback}</>;
    if (showFallback)
      return (
        <RoleDenied requiredRole={role} userRole={user?.role.name as Role} />
      );
    return null;
  }

  return <>{children}</>;
}

// Authentication requirement
interface RequireAuthProps extends BaseAuthProps {}

export function RequireAuth({
  children,
  fallback,
  showFallback = false,
}: RequireAuthProps) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <AuthLoading />;
  }

  if (!isAuthenticated) {
    if (showFallback && fallback) return <>{fallback}</>;
    if (showFallback) return <AuthRequired />;
    return null;
  }

  return <>{children}</>;
}

// Hook for conditional rendering logic
export function usePermissions() {
  const { user, isAuthenticated } = useAuthStore();
  const checker = createPermissionChecker(user?.role.name as Role);

  return {
    isAuthenticated,
    user,
    canAccess: (permission: Permission) =>
      checker?.hasPermission(permission) ?? false,
    canAccessAny: (permissions: Permission[]) =>
      checker?.hasAnyPermission(permissions) ?? false,
    canAccessAll: (permissions: Permission[]) =>
      checker?.hasAllPermissions(permissions) ?? false,
    hasRole: (role: Role) => checker?.hasMinimumRole(role) ?? false,
    getAllPermissions: () => checker?.getUserPermissions() ?? [],
    checker,
  };
}

// Default fallback components
function PermissionDenied({
  permission,
  permissions,
}: {
  permission?: Permission;
  permissions?: Permission[];
}) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          {permission
            ? `Permission required: ${permission}`
            : `Permissions required: ${permissions?.join(", ")}`}
        </p>
      </div>
    </div>
  );
}

function RoleDenied({
  requiredRole,
  userRole,
}: {
  requiredRole: Role;
  userRole?: Role;
}) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <Shield className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          {requiredRole} role required
          {userRole && ` (current: ${userRole})`}
        </p>
      </div>
    </div>
  );
}

function AuthRequired() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Authentication required</p>
      </div>
    </div>
  );
}

function AuthLoading() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
        <p className="text-sm text-muted-foreground">Checking permissions...</p>
      </div>
    </div>
  );
}
