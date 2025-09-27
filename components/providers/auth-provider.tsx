"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth";
import { Loader2 } from "lucide-react";

interface AuthProviderProps {
  children: React.ReactNode;
}

// Routes that don't require authentication
const PUBLIC_ROUTES = ["/login", "/health"];

// Routes that require specific roles
const PROTECTED_ROUTES = {
  manager: ["/inventory/add", "/inventory/edit", "/merchants", "/reports"],
  admin: ["/users", "/users/add", "/users/edit"],
};

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, user, initializeAuth, hasPermission } =
    useAuthStore();
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Initialize auth state on mount
  React.useEffect(() => {
    initializeAuth();
    setIsInitialized(true);
  }, [initializeAuth]);

  // Handle route protection
  React.useEffect(() => {
    if (!isInitialized || isLoading) return;

    // Check if current route is public
    const isPublicRoute = PUBLIC_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(route)
    );

    // If not authenticated and trying to access protected route
    if (!isAuthenticated && !isPublicRoute) {
      router.push("/login");
      return;
    }

    // If authenticated and trying to access login page
    if (isAuthenticated && pathname === "/login") {
      router.push("/dashboard");
      return;
    }

    // Check role-based access
    if (isAuthenticated && user) {
      // Check manager-only routes
      const isManagerRoute = PROTECTED_ROUTES.manager.some((route) =>
        pathname.startsWith(route)
      );
      if (isManagerRoute && !hasPermission("Manager")) {
        router.push("/dashboard");
        return;
      }

      // Check admin-only routes
      const isAdminRoute = PROTECTED_ROUTES.admin.some((route) =>
        pathname.startsWith(route)
      );
      if (isAdminRoute && !hasPermission("Admin")) {
        router.push("/dashboard");
        return;
      }
    }
  }, [
    isAuthenticated,
    isLoading,
    pathname,
    router,
    user,
    hasPermission,
    isInitialized,
  ]);

  // Show loading spinner while initializing
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
