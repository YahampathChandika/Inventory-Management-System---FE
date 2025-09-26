"use client";

import { ProtectedRoute } from "@/components/layout/protected-route";

export default function MerchantsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute requiredRole="Manager">{children}</ProtectedRoute>;
}
