import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";
import { EmailLog, PaginatedResponse, ApiResponse } from "@/types";

// Extended email log query parameters
export interface EmailLogQueryParams {
  page?: number;
  limit?: number;
  status?: "sent" | "failed" | "pending";
  dateFrom?: string; // ISO date string (YYYY-MM-DD)
  dateTo?: string; // ISO date string (YYYY-MM-DD)
  search?: string; // Search recipient email
}

// Detailed email log with full content
export interface EmailLogDetails extends EmailLog {
  sentBy: {
    id: number;
    username: string;
    role: string;
  };
}

// Email log statistics
export interface EmailLogStats {
  totalSent: number;
  totalFailed: number;
  totalPending: number;
  todayCount: number;
  thisWeekCount: number;
  thisMonthCount: number;
  recentActivity: Array<{
    date: string;
    sent: number;
    failed: number;
  }>;
}

// Get paginated email logs with filters
export function useEmailLogs(params: EmailLogQueryParams = {}) {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.status) queryParams.append("status", params.status);
  if (params.dateFrom) queryParams.append("dateFrom", params.dateFrom);
  if (params.dateTo) queryParams.append("dateTo", params.dateTo);
  if (params.search) queryParams.append("search", params.search);

  return useQuery({
    queryKey: ["email-logs", params],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<EmailLog>>(
        `/email-logs?${queryParams.toString()}`
      );
      return response;
    },
    staleTime: 30 * 1000, // 30 seconds (email logs change frequently)
    refetchInterval: 60 * 1000, // Refresh every minute for pending emails
  });
}

// Get single email log with full details
export function useEmailLog(id: number | null) {
  return useQuery({
    queryKey: ["email-logs", id],
    queryFn: async () => {
      if (!id) throw new Error("Email log ID is required");
      const response = await apiClient.get<ApiResponse<EmailLogDetails>>(
        `/email-logs/${id}`
      );
      return response.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes (individual logs don't change often)
  });
}

// Get email logs by status (helper for specific status queries)
export function useEmailLogsByStatus(
  status: "sent" | "failed" | "pending",
  limit: number = 10
) {
  return useQuery({
    queryKey: ["email-logs", "by-status", status, limit],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<EmailLog>>(
        `/email-logs?status=${status}&limit=${limit}&page=1`
      );
      return response.data;
    },
    staleTime: 60 * 1000, // 1 minute
  });
}

// Get recent email activity (for dashboard widgets)
export function useRecentEmailActivity(days: number = 7) {
  const dateFrom = new Date();
  dateFrom.setDate(dateFrom.getDate() - days);

  return useQuery({
    queryKey: ["email-logs", "recent", days],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<EmailLog>>(
        `/email-logs?dateFrom=${dateFrom.toISOString().split("T")[0]}&limit=100`
      );

      // Process data for charts/stats
      const logs = response.data;
      const activityByDate = logs.reduce((acc, log) => {
        const date = new Date(log.createdAt).toISOString().split("T")[0];
        if (!acc[date]) {
          acc[date] = { date, sent: 0, failed: 0, pending: 0 };
        }
        acc[date][log.status as keyof (typeof acc)[typeof date]]++;
        return acc;
      }, {} as Record<string, { date: string; sent: number; failed: number; pending: number }>);

      return {
        logs,
        activityByDate: Object.values(activityByDate).sort((a, b) =>
          a.date.localeCompare(b.date)
        ),
        totalCount: response.pagination.total,
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Get email log statistics for dashboard
export function useEmailLogStats() {
  return useQuery({
    queryKey: ["email-logs", "stats"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const thisWeek = new Date();
      thisWeek.setDate(thisWeek.getDate() - 7);
      const thisMonth = new Date();
      thisMonth.setDate(thisMonth.getDate() - 30);

      // Fetch different status counts and date ranges
      const [
        allLogs,
        sentLogs,
        failedLogs,
        pendingLogs,
        todayLogs,
        weekLogs,
        monthLogs,
      ] = await Promise.all([
        apiClient.get<PaginatedResponse<EmailLog>>("/email-logs?limit=1"),
        apiClient.get<PaginatedResponse<EmailLog>>(
          "/email-logs?status=sent&limit=1"
        ),
        apiClient.get<PaginatedResponse<EmailLog>>(
          "/email-logs?status=failed&limit=1"
        ),
        apiClient.get<PaginatedResponse<EmailLog>>(
          "/email-logs?status=pending&limit=1"
        ),
        apiClient.get<PaginatedResponse<EmailLog>>(
          `/email-logs?dateFrom=${today}&limit=1`
        ),
        apiClient.get<PaginatedResponse<EmailLog>>(
          `/email-logs?dateFrom=${thisWeek.toISOString().split("T")[0]}&limit=1`
        ),
        apiClient.get<PaginatedResponse<EmailLog>>(
          `/email-logs?dateFrom=${
            thisMonth.toISOString().split("T")[0]
          }&limit=1`
        ),
      ]);

      return {
        totalEmails: allLogs.pagination.total,
        totalSent: sentLogs.pagination.total,
        totalFailed: failedLogs.pagination.total,
        totalPending: pendingLogs.pagination.total,
        todayCount: todayLogs.pagination.total,
        thisWeekCount: weekLogs.pagination.total,
        thisMonthCount: monthLogs.pagination.total,
        successRate:
          allLogs.pagination.total > 0
            ? Math.round(
                (sentLogs.pagination.total / allLogs.pagination.total) * 100
              )
            : 0,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refresh every 10 minutes
  });
}

// Retry failed email (if backend supports it)
export function useRetryFailedEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (emailLogId: number) => {
      const response = await apiClient.post<ApiResponse<{ success: boolean }>>(
        `/email-logs/${emailLogId}/retry`
      );
      return response.data;
    },
    onSuccess: (_, emailLogId) => {
      // Invalidate email logs queries
      queryClient.invalidateQueries({ queryKey: ["email-logs"] });
      toast.success("Email retry queued successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to retry email");
    },
  });
}

// Delete email log (admin only)
export function useDeleteEmailLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (emailLogId: number) => {
      const response = await apiClient.delete<
        ApiResponse<{ success: boolean }>
      >(`/email-logs/${emailLogId}`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate email logs queries
      queryClient.invalidateQueries({ queryKey: ["email-logs"] });
      toast.success("Email log deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete email log");
    },
  });
}

// Bulk delete email logs (admin only)
export function useBulkDeleteEmailLogs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (emailLogIds: number[]) => {
      const response = await apiClient.delete<
        ApiResponse<{ deletedCount: number }>
      >("/email-logs/bulk", { body: JSON.stringify({ ids: emailLogIds }) });
      return response.data;
    },
    onSuccess: (result) => {
      // Invalidate email logs queries
      queryClient.invalidateQueries({ queryKey: ["email-logs"] });
      toast.success(`${result.deletedCount} email logs deleted successfully`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete email logs");
    },
  });
}

// Export email logs as CSV
export function useExportEmailLogs() {
  return useMutation({
    mutationFn: async (params: EmailLogQueryParams = {}) => {
      const queryParams = new URLSearchParams();

      if (params.status) queryParams.append("status", params.status);
      if (params.dateFrom) queryParams.append("dateFrom", params.dateFrom);
      if (params.dateTo) queryParams.append("dateTo", params.dateTo);
      queryParams.append("format", "csv");
      queryParams.append("limit", "10000"); // Large limit for export

      const response = await apiClient.get<string>(
        `/email-logs/export?${queryParams.toString()}`
      );

      // Create and trigger download
      const blob = new Blob([response], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `email-logs-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return response;
    },
    onSuccess: () => {
      toast.success("📥 Email logs exported successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to export email logs");
    },
  });
}
