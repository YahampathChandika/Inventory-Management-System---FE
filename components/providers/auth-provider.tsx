"use client";

import React from "react";
import { useAuthStore } from "@/lib/store/auth";
import { Loader2 } from "lucide-react";

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider - Handles ONLY authentication initialization
 * Route protection is handled by middleware and declarative components
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const { initializeAuth } = useAuthStore();
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Initialize auth state on mount
  React.useEffect(() => {
    const initialize = async () => {
      await initializeAuth();
      setIsInitialized(true);
    };

    initialize();
  }, [initializeAuth]);

  // Show loading spinner while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Initializing...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Optional: Debug component for development
export function AuthDebugInfo() {
  const { user, isAuthenticated, token, isLoading } = useAuthStore();

  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-black/80 text-white text-xs rounded max-w-xs">
      <div className="font-bold mb-2">Auth Debug Info</div>
      <div>Authenticated: {isAuthenticated ? "✅" : "❌"}</div>
      <div>User: {user?.username || "None"}</div>
      <div>Role: {user?.role.name || "None"}</div>
      <div>Token: {token ? "✅" : "❌"}</div>
      <div>Loading: {isLoading ? "⏳" : "✅"}</div>
    </div>
  );
}
