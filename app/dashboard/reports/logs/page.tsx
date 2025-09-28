"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Mail,
  TrendingUp,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { EmailLogsTable } from "@/components/reports/email-logs-table";
import { useEmailLogStats, useExportEmailLogs } from "@/hooks/use-email-logs";
import { useAuthStore } from "@/lib/store/auth";

export default function EmailLogsPage() {
  const { hasPermission } = useAuthStore();
  const { data: emailStats } = useEmailLogStats();
  const exportMutation = useExportEmailLogs();

  const handleExportAll = () => {
    exportMutation.mutate({});
  };

  if (!hasPermission("Manager")) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Mail className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">
            You don't have permission to view email logs
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-11/12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/reports">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="md:text-2xl font-bold">Email Logs</h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              View and manage all sent inventory reports
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExportAll}
            disabled={exportMutation.isPending}
          >
            <Download className="mr-2 h-4 w-4" />
            Export All
          </Button>

          <Link href="/dashboard/reports/send">
            <Button>
              <Mail className="mr-2 h-4 w-4" />
              Send New Report
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      {emailStats && (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Emails
              </CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{emailStats.totalEmails}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Successfully Sent
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {emailStats.totalSent}
              </div>
              <p className="text-xs text-muted-foreground">
                {emailStats.successRate}% success rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {emailStats.totalFailed}
              </div>
              <p className="text-xs text-muted-foreground">Need attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {emailStats.thisMonthCount}
              </div>
              <p className="text-xs text-muted-foreground">
                vs {emailStats.thisWeekCount} this week
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Failed Emails Alert */}
      {emailStats && emailStats.totalFailed > 0 && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div className="flex-1">
                <h3 className="font-medium text-red-800 dark:text-red-200">
                  {emailStats.totalFailed} Failed Email
                  {emailStats.totalFailed !== 1 ? "s" : ""}
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Some emails failed to send. Review the logs below to identify
                  issues.
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/reports/logs?status=failed">
                  View Failed
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Email Logs Table */}
      <EmailLogsTable showFilters={true} />

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Understanding Email Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Sent</h4>
                <p className="text-sm text-muted-foreground">
                  Email was successfully delivered to the recipient's server
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Failed</h4>
                <p className="text-sm text-muted-foreground">
                  Email failed to send due to invalid address or server error
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Pending</h4>
                <p className="text-sm text-muted-foreground">
                  Email is queued and waiting to be sent
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
