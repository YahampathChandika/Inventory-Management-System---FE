"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Mail,
  Send,
  Users,
  Package,
  AlertTriangle,
  Download,
  History,
  MoreHorizontal,
  Plus,
  Loader2,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  useReportStats,
  useSendToAllMerchants,
  useDownloadReport,
} from "@/hooks/use-reports";
import {
  useEmailLogStats,
  useRecentEmailActivity,
} from "@/hooks/use-email-logs";
import { useActiveMerchants } from "@/hooks/use-merchants";
import { useAuthStore } from "@/lib/store/auth";
import { toast } from "sonner";

export default function ReportsPage() {
  const { hasPermission } = useAuthStore();
  const { data: reportStats, isLoading: isLoadingStats } = useReportStats();
  const { data: emailStats } = useEmailLogStats();
  const { data: recentActivity } = useRecentEmailActivity(7);
  const { data: activeMerchants } = useActiveMerchants();

  const sendToAllMutation = useSendToAllMerchants();
  const downloadMutation = useDownloadReport();

  const handleQuickSend = () => {
    sendToAllMutation.mutate({
      subject: `Weekly Inventory Report - ${new Date().toLocaleDateString()}`,
      customMessage:
        "Please find your weekly inventory report below with current stock levels.",
    });
  };

  const handleDownload = (format: "csv" | "json") => {
    downloadMutation.mutate(format);
  };

  if (!hasPermission("Manager")) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">
            You don't have permission to access reports
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inventory Reports</h1>
          <p className="text-muted-foreground">
            Send inventory reports and manage email communications
          </p>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleDownload("csv")}>
                {downloadMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Download as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDownload("json")}>
                <Download className="mr-2 h-4 w-4" />
                Download as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/dashboard/reports/send">
            <Button>
              <Send className="mr-2 h-4 w-4" />
              Send Report
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                reportStats?.totalItems || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">Items in inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Low Stock Items
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {reportStats?.lowStockItems || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Items below 10 units
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Merchants
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeMerchants?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Ready to receive reports
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {emailStats?.thisMonthCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">Reports sent</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Send to All Merchants</h3>
                <p className="text-sm text-muted-foreground">
                  Send inventory report to {activeMerchants?.length || 0} active
                  merchants
                </p>
              </div>
              <Button
                size="sm"
                onClick={handleQuickSend}
                disabled={
                  sendToAllMutation.isPending || !activeMerchants?.length
                }
              >
                {sendToAllMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Send Now
              </Button>
            </div>

            <div className="flex items-center justify-between gap-4 p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Custom Recipients</h3>
                <p className="text-sm text-muted-foreground">
                  Select specific merchants or add custom emails
                </p>
              </div>
              <Link href="/dashboard/reports/send">
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Customize
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Email History</h3>
                <p className="text-sm text-muted-foreground">
                  View all sent reports and delivery status
                </p>
              </div>
              <Link href="/dashboard/reports/logs">
                <Button variant="outline" size="sm">
                  <History className="mr-2 h-4 w-4" />
                  View Logs
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Email Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Email Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {emailStats && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-2xl font-bold text-green-600">
                        {emailStats.totalSent}
                      </span>
                    </div>
                    <p className="text-xs text-green-700 dark:text-green-400">
                      Sent
                    </p>
                  </div>

                  <div className="text-center p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <XCircle className="h-4 w-4 text-red-600 mr-1" />
                      <span className="text-2xl font-bold text-red-600">
                        {emailStats.totalFailed}
                      </span>
                    </div>
                    <p className="text-xs text-red-700 dark:text-red-400">
                      Failed
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Success Rate</span>
                    <Badge
                      variant={
                        emailStats.successRate >= 90 ? "default" : "secondary"
                      }
                    >
                      {emailStats.successRate}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Today</span>
                    <span className="text-sm font-medium">
                      {emailStats.todayCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">This Week</span>
                    <span className="text-sm font-medium">
                      {emailStats.thisWeekCount}
                    </span>
                  </div>
                  {emailStats.totalPending > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </span>
                      <Badge variant="outline">{emailStats.totalPending}</Badge>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      {recentActivity && recentActivity.activityByDate.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Recent Activity (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentActivity.activityByDate.slice(-5).map((activity) => (
                <div
                  key={activity.date}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <span className="text-sm">
                    {new Date(activity.date).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span className="text-sm">{activity.sent}</span>
                    </div>
                    {activity.failed > 0 && (
                      <div className="flex items-center gap-1">
                        <XCircle className="h-3 w-3 text-red-600" />
                        <span className="text-sm">{activity.failed}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
