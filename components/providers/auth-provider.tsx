"use client";

import React from "react";
import { useAuthStore } from "@/lib/store/auth";
import { Loader2 } from "lucide-react";

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider - Handles authentication initialization from cookies
 * Route protection is handled by middleware and declarative components
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const { initializeAuth, isLoading } = useAuthStore();
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Initialize auth state on mount
  React.useEffect(() => {
    const initialize = async () => {
      try {
        await initializeAuth();
      } catch (error) {
        console.error("Failed to initialize auth:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    initialize();
  }, [initializeAuth]);

  // Show loading spinner while initializing
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            {!isInitialized ? "Initializing..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Debug component for development (shows auth state)
export function AuthDebugInfo() {
  const { user, isAuthenticated, token, isLoading } = useAuthStore();

  // Only show in development
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-black/80 text-white text-xs rounded-lg max-w-xs z-50 font-mono">
      <div className="font-bold mb-2 text-green-400">🔍 Auth Debug</div>
      <div className="space-y-1">
        <div>
          <span className="text-gray-300">Authenticated:</span>{" "}
          {isAuthenticated ? "✅" : "❌"}
        </div>
        <div>
          <span className="text-gray-300">User:</span>{" "}
          {user?.username || "None"}
        </div>
        <div>
          <span className="text-gray-300">Role:</span>{" "}
          {user?.role.name || "None"}
        </div>
        <div>
          <span className="text-gray-300">Token:</span> {token ? "✅" : "❌"}
        </div>
        <div>
          <span className="text-gray-300">Loading:</span>{" "}
          {isLoading ? "⏳" : "✅"}
        </div>
        {token && (
          <div className="mt-2 pt-2 border-t border-gray-600">
            <div className="text-gray-300 text-xs">
              Token: {token.substring(0, 20)}...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
