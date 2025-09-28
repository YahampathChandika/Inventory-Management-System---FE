"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Package,
  AlertTriangle,
  Users,
  Mail,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Loader2,
} from "lucide-react";
import { useReportStats } from "@/hooks/use-reports";
import { useEmailLogStats } from "@/hooks/use-email-logs";
import { useActiveMerchants } from "@/hooks/use-merchants";

interface ReportStatsProps {
  variant?: "grid" | "inline";
  showEmailStats?: boolean;
  className?: string;
}

export function ReportStats({
  variant = "grid",
  showEmailStats = true,
  className = "",
}: ReportStatsProps) {
  const { data: reportStats, isLoading: isLoadingReportStats } =
    useReportStats();
  const { data: emailStats, isLoading: isLoadingEmailStats } =
    useEmailLogStats();
  const { data: merchants } = useActiveMerchants();

  const isLoading = isLoadingReportStats || isLoadingEmailStats;

  const inventoryStats = [
    {
      title: "Total Items",
      value: reportStats?.totalItems || 0,
      icon: Package,
      description: "Items in inventory",
      trend: null,
    },
    {
      title: "Low Stock Items",
      value: reportStats?.lowStockItems || 0,
      icon: AlertTriangle,
      description: "Items below 10 units",
      trend: null,
      variant: "warning" as const,
    },
    {
      title: "Active Merchants",
      value: merchants?.length || 0,
      icon: Users,
      description: "Ready to receive reports",
      trend: null,
    },
  ];

  const emailStatsData = emailStats
    ? [
        {
          title: "Total Emails",
          value: emailStats.totalEmails,
          icon: Mail,
          description: "All time",
          trend: null,
        },
        {
          title: "Success Rate",
          value: `${emailStats.successRate}%`,
          icon: emailStats.successRate >= 90 ? TrendingUp : TrendingDown,
          description: "Delivery success",
          trend: emailStats.successRate >= 90 ? "up" : "down",
          variant:
            emailStats.successRate >= 90 ? "success" : ("warning" as const),
        },
        {
          title: "This Month",
          value: emailStats.thisMonthCount,
          icon: Calendar,
          description: "Reports sent",
          trend: null,
        },
        {
          title: "Today",
          value: emailStats.todayCount,
          icon: Calendar,
          description: "Reports sent today",
          trend: null,
        },
      ]
    : [];

  const allStats = showEmailStats
    ? [...inventoryStats, ...emailStatsData]
    : inventoryStats;

  if (variant === "inline") {
    return (
      <div className={`flex items-center gap-6 ${className}`}>
        {allStats.slice(0, 4).map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  stat.variant === "warning"
                    ? "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400"
                    : stat.variant === "success"
                    ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
                    : "bg-primary/10 text-primary"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <div className="text-lg font-bold">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    stat.value
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {stat.title}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-4 ${className}`}>
      {allStats.map((stat, index) => {
        const Icon = stat.icon;

        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon
                className={`h-4 w-4 ${
                  stat.variant === "warning"
                    ? "text-orange-600"
                    : stat.variant === "success"
                    ? "text-green-600"
                    : "text-muted-foreground"
                }`}
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <span
                    className={
                      stat.variant === "warning"
                        ? "text-orange-600"
                        : stat.variant === "success"
                        ? "text-green-600"
                        : ""
                    }
                  >
                    {stat.value}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
              {stat.trend && (
                <div className="mt-1">
                  <Badge
                    variant={stat.trend === "up" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {stat.trend === "up" ? "Good" : "Needs Attention"}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Detailed Email Stats Card */}
      {showEmailStats && emailStats && (
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Sent Emails */}
              <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle className="h-8 w-8 text-green-600 mr-2" />
                  <span className="text-3xl font-bold text-green-600">
                    {emailStats.totalSent}
                  </span>
                </div>
                <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                  Successfully Sent
                </p>
              </div>

              {/* Failed Emails */}
              <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <XCircle className="h-8 w-8 text-red-600 mr-2" />
                  <span className="text-3xl font-bold text-red-600">
                    {emailStats.totalFailed}
                  </span>
                </div>
                <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                  Failed
                </p>
              </div>

              {/* Pending Emails */}
              {emailStats.totalPending > 0 && (
                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="h-8 w-8 text-yellow-600 mr-2" />
                    <span className="text-3xl font-bold text-yellow-600">
                      {emailStats.totalPending}
                    </span>
                  </div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400 font-medium">
                    Pending
                  </p>
                </div>
              )}

              {/* Success Rate Progress */}
              <div className="flex flex-col justify-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="text-center mb-2">
                  <span className="text-2xl font-bold text-blue-600">
                    {emailStats.successRate}%
                  </span>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    Success Rate
                  </p>
                </div>
                <Progress value={emailStats.successRate} className="w-full" />
              </div>
            </div>

            {/* Time Period Stats */}
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="text-center">
                <div className="text-xl font-bold">{emailStats.todayCount}</div>
                <div className="text-sm text-muted-foreground">Today</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">
                  {emailStats.thisWeekCount}
                </div>
                <div className="text-sm text-muted-foreground">This Week</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">
                  {emailStats.thisMonthCount}
                </div>
                <div className="text-sm text-muted-foreground">This Month</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
