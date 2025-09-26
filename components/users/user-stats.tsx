"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUserStats } from "@/hooks/use-users";
import { useAuthStore } from "@/lib/store/auth";
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  Loader2,
  AlertTriangle,
} from "lucide-react";

export function UserStatsCards() {
  const { data: stats, isLoading, error } = useUserStats();
  const { hasPermission } = useAuthStore();

  // Only show for admins
  if (!hasPermission("Admin")) {
    return null;
  }

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
              Failed to load user stats
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const statsCards = [
    {
      title: "Total Users",
      value: stats?.total || 0,
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
      description: "All system users",
    },
    {
      title: "Active Users",
      value: stats?.activeCount || 0,
      icon: <UserCheck className="h-4 w-4 text-green-600" />,
      description: "Users who can login",
    },
    {
      title: "Disabled Users",
      value: stats?.inactiveCount || 0,
      icon: <UserX className="h-4 w-4 text-red-600" />,
      description: "Disabled accounts",
    },
    {
      title: "Administrators",
      value: stats?.adminCount || 0,
      icon: <Shield className="h-4 w-4 text-red-600" />,
      description: "Admin users",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsCards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            {card.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function UserRoleBreakdown() {
  const { data: stats, isLoading, error } = useUserStats();
  const { hasPermission } = useAuthStore();

  // Only show for admins
  if (!hasPermission("Admin")) {
    return null;
  }

  if (isLoading || error || !stats) {
    return null;
  }

  const roleData = [
    { name: "Admin", count: stats.adminCount, color: "bg-red-500" },
    { name: "Manager", count: stats.managerCount, color: "bg-blue-500" },
    { name: "Viewer", count: stats.viewerCount, color: "bg-green-500" },
  ];

  const total = stats.total;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          User Roles Distribution
        </CardTitle>
        <CardDescription>Breakdown of users by role</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {roleData.map((role) => (
            <div key={role.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${role.color}`} />
                <span className="text-sm font-medium">{role.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {total > 0 ? Math.round((role.count / total) * 100) : 0}%
                </span>
                <span className="text-sm font-bold">{role.count}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Simple progress bars */}
        <div className="mt-4 space-y-2">
          {roleData.map((role) => (
            <div key={`${role.name}-bar`} className="flex items-center gap-2">
              <span className="text-xs w-16 text-muted-foreground">
                {role.name}
              </span>
              <div className="flex-1 bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${role.color}`}
                  style={{
                    width: total > 0 ? `${(role.count / total) * 100}%` : "0%",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
