"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuickStats } from "@/hooks/use-dashboard";
import { useAuthStore } from "@/lib/store/auth";
import {
  Package,
  Users,
  Store,
  TrendingUp,
  Loader2,
  AlertTriangle,
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function StatCard({ title, value, icon, description, trend }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div
            className={`flex items-center text-xs mt-1 ${
              trend.isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            <TrendingUp className="h-3 w-3 mr-1" />
            {trend.value}% from last month
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function StatsCards() {
  const { data: stats, isLoading, error } = useQuickStats();
  const { hasPermission } = useAuthStore();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="h-7 w-16 bg-muted animate-pulse rounded mb-1" />
              <div className="h-3 w-24 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Failed to load stats
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const cards = [
    {
      title: "Total Inventory",
      value: stats?.inventoryCount || 0,
      icon: <Package className="h-4 w-4 text-muted-foreground" />,
      description: "Items in stock",
      show: true,
    },
    {
      title: "System Users",
      value: stats?.userCount || 0,
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
      description: "Active users",
      show: hasPermission("Admin"),
    },
    {
      title: "Merchants",
      value: stats?.merchantCount || 0,
      icon: <Store className="h-4 w-4 text-muted-foreground" />,
      description: "Registered merchants",
      show: hasPermission("Manager"),
    },
    {
      title: "Low Stock Items",
      value: "—",
      icon: <AlertTriangle className="h-4 w-4 text-muted-foreground" />,
      description: "Items running low",
      show: true,
    },
  ].filter((card) => card.show);

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <StatCard
          key={index}
          title={card.title}
          value={card.value}
          icon={card.icon}
          description={card.description}
        />
      ))}
    </div>
  );
}
