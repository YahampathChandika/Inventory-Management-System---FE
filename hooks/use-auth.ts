import { useAuthStore } from "@/lib/store/auth";

/**
 * Hook to access authentication state and actions
 * This is a convenience wrapper around the auth store
 */
export function useAuth() {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasPermission,
    updateUser,
  } = useAuthStore();

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,

    // Actions
    login,
    logout,
    updateUser,

    // Permission helpers
    hasPermission,
    isAdmin: hasPermission("Admin"),
    isManager: hasPermission("Manager"),
    isViewer: hasPermission("Viewer"),

    // Role checks
    canManageInventory: hasPermission("Manager"),
    canManageUsers: hasPermission("Admin"),
    canSendReports: hasPermission("Manager"),
    canManageMerchants: hasPermission("Manager"),

    // Convenience getters
    userRole: user?.role.name,
    userName: user?.username,
    userEmail: user?.email,
  };
}

// Hook specifically for permission checking
export function usePermissions() {
  const { hasPermission, user } = useAuthStore();

  return {
    hasPermission,
    canAccess: (requiredRole: "Admin" | "Manager" | "Viewer") =>
      hasPermission(requiredRole),
    isAdmin: hasPermission("Admin"),
    isManager: hasPermission("Manager"),
    isViewer: hasPermission("Viewer"),
    userRole: user?.role.name,
  };
}

// Hook for getting current user info
export function useCurrentUser() {
  const { user, updateUser, isAuthenticated } = useAuthStore();

  return {
    user,
    updateUser,
    isAuthenticated,
    role: user?.role.name,
    username: user?.username,
    email: user?.email,
    isActive: user?.isActive,
  };
}
