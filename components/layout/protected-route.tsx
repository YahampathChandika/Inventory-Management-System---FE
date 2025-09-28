"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/lib/store/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "Admin" | "Manager" | "Viewer";
  fallback?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  requiredRole = "Viewer",
  fallback,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { hasPermission } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null; // Redirect in progress
  }

  // Check role permissions
  if (!hasPermission(requiredRole)) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-2">
              Access Denied
            </h1>
            <p className="text-muted-foreground">
              You don&apos;t have permission to view this page.
            </p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}
