"use client";

import { ProtectedRoute } from "@/components/layout/protected-route";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <div className="flex">
          {/* Sidebar */}
          <Sidebar />

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-h-screen">
            {/* Header */}
            <Header />

            {/* Page Content */}
            <main className="flex-1 p-6">{children}</main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
