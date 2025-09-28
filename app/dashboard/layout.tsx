"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Loader2, AlertTriangle } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved));
    }
  }, []);

  // Save collapsed state to localStorage
  const handleToggleCollapse = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    localStorage.setItem("sidebar-collapsed", JSON.stringify(newCollapsed));
  };

  useEffect(() => {
    // Redirect unauthenticated users to login
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error if user data is missing
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertTriangle className="h-8 w-8 text-destructive" />
          <div>
            <h2 className="text-lg font-semibold">Authentication Required</h2>
            <p className="text-sm text-muted-foreground">
              Please log in to access the dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render dashboard layout for authenticated users
  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar - Hidden on mobile */}
        <div className="hidden md:block">
          <Sidebar isCollapsed={isCollapsed} className="h-full" />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
          {/* Header */}
          <Header
            isCollapsed={isCollapsed}
            onToggleCollapse={handleToggleCollapse}
          />

          {/* Page Content */}
          <main className="flex-1 overflow-auto">
            <div className="p-4 md:p-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
