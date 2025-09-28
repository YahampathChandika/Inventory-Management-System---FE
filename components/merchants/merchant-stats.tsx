"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMerchantStats } from "@/hooks/use-merchants";
import { useAuthStore } from "@/lib/store/auth";
import {
  Store,
  CheckCircle,
  XCircle,
  Mail,
  Loader2,
  AlertTriangle,
} from "lucide-react";

export function MerchantStatsCards() {
  const { data: stats, isLoading, error } = useMerchantStats();
  const { hasPermission } = useAuthStore();

  // Only show for managers and admins
  if (!hasPermission("Manager")) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
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
              Failed to load merchant stats
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const statsCards = [
    {
      title: "Total Merchants",
      value: stats?.total || 0,
      icon: <Store className="h-4 w-4 text-muted-foreground" />,
      description: "All merchant contacts",
    },
    {
      title: "Active Merchants",
      value: stats?.activeCount || 0,
      icon: <CheckCircle className="h-4 w-4 text-green-600" />,
      description: "Receiving reports",
    },
    {
      title: "Inactive Merchants",
      value: stats?.inactiveCount || 0,
      icon: <XCircle className="h-4 w-4 text-red-600" />,
      description: "Not receiving reports",
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-3">
      {statsCards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-2 md:px-6">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            {card.icon}
          </CardHeader>
          <CardContent className="px-2 md:px-6">
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

export function MerchantStatusBreakdown() {
  const { data: stats, isLoading, error } = useMerchantStats();
  const { hasPermission } = useAuthStore();

  // Only show for managers and admins
  if (!hasPermission("Manager")) {
    return null;
  }

  if (isLoading || error || !stats) {
    return null;
  }

  const statusData = [
    { name: "Active", count: stats.activeCount, color: "bg-green-500" },
    { name: "Inactive", count: stats.inactiveCount, color: "bg-red-500" },
  ];

  const total = stats.total;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Merchant Status
        </CardTitle>
        <CardDescription>
          Distribution of active vs inactive merchants
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {statusData.map((status) => (
            <div
              key={status.name}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${status.color}`} />
                <span className="text-sm font-medium">{status.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {total > 0 ? Math.round((status.count / total) * 100) : 0}%
                </span>
                <span className="text-sm font-bold">{status.count}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Simple progress bars */}
        <div className="mt-4 space-y-2">
          {statusData.map((status) => (
            <div key={`${status.name}-bar`} className="flex items-center gap-2">
              <span className="text-xs w-16 text-muted-foreground">
                {status.name}
              </span>
              <div className="flex-1 bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${status.color}`}
                  style={{
                    width:
                      total > 0 ? `${(status.count / total) * 100}%` : "0%",
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Additional info */}
        {total > 0 && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              📧 Only active merchants will receive inventory reports via email
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
