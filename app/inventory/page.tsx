"use client";

import { ProtectedRoute } from "@/components/layout/protected-route";

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute requiredRole="Viewer">{children}</ProtectedRoute>;
}
