"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  Filter,
  Download,
  Eye,
  MoreHorizontal,
  RefreshCw,
  Calendar,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import {
  useEmailLogs,
  useExportEmailLogs,
  EmailLogQueryParams,
} from "@/hooks/use-email-logs";
import { useAuthStore } from "@/lib/store/auth";
import { formatDistanceToNow } from "date-fns";

interface EmailLogsTableProps {
  defaultParams?: Partial<EmailLogQueryParams>;
  showFilters?: boolean;
  maxHeight?: string;
}

export function EmailLogsTable({
  defaultParams = {},
  showFilters = true,
  maxHeight = "none",
}: EmailLogsTableProps) {
  const { hasPermission } = useAuthStore();
  const [queryParams, setQueryParams] = useState<EmailLogQueryParams>({
    page: 1,
    limit: 10,
    ...defaultParams,
  });

  const { data, isLoading, error, refetch } = useEmailLogs(queryParams);
  const exportMutation = useExportEmailLogs();

  const handleSearch = (search: string) => {
    setQueryParams((prev) => ({
      ...prev,
      search,
      page: 1,
    }));
  };

  const handleStatusFilter = (status: string) => {
    setQueryParams((prev) => ({
      ...prev,
      status: status === "all" ? undefined : (status as any),
      page: 1,
    }));
  };

  const handleDateFilter = (period: string) => {
    const now = new Date();
    let dateFrom: string | undefined;

    switch (period) {
      case "today":
        dateFrom = now.toISOString().split("T")[0];
        break;
      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFrom = weekAgo.toISOString().split("T")[0];
        break;
      case "month":
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        dateFrom = monthAgo.toISOString().split("T")[0];
        break;
      default:
        dateFrom = undefined;
    }

    setQueryParams((prev) => ({
      ...prev,
      dateFrom,
      dateTo: undefined,
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setQueryParams((prev) => ({ ...prev, page }));
  };

  const handleExport = () => {
    exportMutation.mutate(queryParams);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return (
          <Badge
            variant="default"
            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          >
            <CheckCircle className="mr-1 h-3 w-3" />
            Sent
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Failed
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      full: date.toLocaleString(),
      relative: formatDistanceToNow(date, { addSuffix: true }),
    };
  };

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Failed to load email logs
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="mt-2"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      {showFilters && (
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by recipient email..."
              value={queryParams.search || ""}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select
            value={queryParams.status || "all"}
            onValueChange={handleStatusFilter}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={queryParams.dateFrom ? "custom" : "all"}
            onValueChange={handleDateFilter}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={exportMutation.isPending}
            >
              {exportMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Export
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div style={{ maxHeight }} className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-64">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : data?.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-64">
                      <div className="flex flex-col items-center justify-center">
                        <Mail className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">
                          No email logs found
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Try adjusting your filters or send some reports
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.data.map((log) => {
                    const sentDate = log.sentAt ? formatDate(log.sentAt) : null;
                    const createdDate = formatDate(log.createdAt);

                    return (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium truncate max-w-48">
                              {log.recipientEmail}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className="truncate max-w-64 block"
                            title={log.subject}
                          >
                            {log.subject}
                          </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(log.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {log.sentBy.username}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div title={sentDate?.full || createdDate.full}>
                              {sentDate?.relative || createdDate.relative}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {sentDate ? "Sent" : "Created"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/dashboard/reports/logs/${log.id}`}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              {log.status === "failed" &&
                                hasPermission("Admin") && (
                                  <DropdownMenuItem>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Retry Send
                                  </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {data && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <div className="text-sm text-muted-foreground hidden sm:block">
                Showing {(data.pagination.page - 1) * data.pagination.limit + 1}{" "}
                to{" "}
                {Math.min(
                  data.pagination.page * data.pagination.limit,
                  data.pagination.total
                )}{" "}
                of {data.pagination.total} entries
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(data.pagination.page - 1)}
                  disabled={!data.pagination.hasPrev}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {data.pagination.page} of {data.pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(data.pagination.page + 1)}
                  disabled={!data.pagination.hasNext}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
