"use client";

import { ProtectedRoute } from "@/components/layout/protected-route";

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute requiredRole="Admin">{children}</ProtectedRoute>;
}
