"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatsCards } from "@/components/dashboard/stats-cards";
import {
  MerchantStatsCards,
  MerchantStatusBreakdown,
} from "@/components/merchants/merchant-stats";
import { useAuthStore } from "@/lib/store/auth";
import {
  Plus,
  Package,
  Users,
  Store,
  Mail,
  ArrowRight,
  Clock,
} from "lucide-react";

export default function DashboardPage() {
  const { user, hasPermission } = useAuthStore();

  const quickActions = [
    {
      title: "Add New Item",
      description: "Add items to inventory",
      href: "/dashboard/inventory/new",
      icon: <Plus className="h-5 w-5" />,
      show: hasPermission("Manager"),
    },
    {
      title: "View Inventory",
      description: "Browse all inventory items",
      href: "/dashboard/inventory",
      icon: <Package className="h-5 w-5" />,
      show: true,
    },
    {
      title: "Manage Merchants",
      description: "Add or edit merchant contacts",
      href: "/dashboard/merchants",
      icon: <Store className="h-5 w-5" />,
      show: hasPermission("Manager"),
    },
    {
      title: "Manage Users",
      description: "Add or edit system users",
      href: "/dashboard/users",
      icon: <Users className="h-5 w-5" />,
      show: hasPermission("Admin"),
    },
    {
      title: "Send Reports",
      description: "Email inventory reports",
      href: "/dashboard/reports",
      icon: <Mail className="h-5 w-5" />,
      show: hasPermission("Manager"),
    },
  ].filter((action) => action.show);

  const recentActivities = [
    {
      action: "Added new inventory item",
      item: "Wireless Headphones",
      time: "2 hours ago",
    },
    {
      action: "Updated stock quantity",
      item: "Laptop Charger",
      time: "4 hours ago",
    },
    {
      action: "Sent inventory report",
      item: "Monthly Report",
      time: "1 day ago",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user?.username}!</h1>
        <p className="text-muted-foreground mt-2">
          Here's what's happening with your inventory today.
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Manager+ Merchant Stats */}
      {hasPermission("Manager") && <MerchantStatsCards />}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <div
          className={hasPermission("Admin") ? "lg:col-span-2" : "lg:col-span-2"}
        >
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks you can perform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {quickActions.map((action, index) => (
                  <Link key={index} href={action.href}>
                    <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <CardContent className="flex items-center p-4">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                            {action.icon}
                          </div>
                          <div>
                            <h3 className="font-medium">{action.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {action.description}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity and User Role Breakdown */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest system activities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {activity.item}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {activity.time}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Merchant Status Breakdown for Managers */}
          {hasPermission("Manager") && <MerchantStatusBreakdown />}
        </div>
      </div>
    </div>
  );
}
