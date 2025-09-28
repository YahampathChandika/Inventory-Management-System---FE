import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";
import { ApiResponse, SendInventoryReport } from "@/types";

// Types for reports
export interface InventoryReportData {
  itemName: string;
  quantity: number;
  sku: string;
  unitPrice: number;
}

export interface SendReportResponse {
  jobId: string;
  recipientCount: number;
  totalSent: number;
  totalFailed: number;
  estimatedTime: string;
  results: Array<{
    email: string;
    success: boolean;
    error?: string;
  }>;
}

export interface ReportStats {
  totalItems: number;
  lowStockItems: number;
  activeMerchants: number;
  lastReportGenerated: string;
}

// Get inventory report data (for preview or download)
export function useInventoryReportData(format: "json" | "csv" = "json") {
  return useQuery({
    queryKey: ["reports", "inventory", format],
    queryFn: async () => {
      const response = await apiClient.get<
        ApiResponse<InventoryReportData[] | string>
      >(`/reports/inventory?format=${format}`);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes (inventory changes frequently)
  });
}

// Send inventory report via email
export function useSendInventoryReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SendInventoryReport) => {
      const response = await apiClient.post<ApiResponse<SendReportResponse>>(
        "/reports/send-inventory",
        data
      );
      return response.data;
    },
    onSuccess: (result, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["email-logs"] });
      queryClient.invalidateQueries({ queryKey: ["reports", "stats"] });

      // Show success message with details
      const successMessage = `📧 Report sent successfully!
      • Recipients: ${result.recipientCount}
      • Sent: ${result.totalSent}
      ${result.totalFailed > 0 ? `• Failed: ${result.totalFailed}` : ""}`;

      toast.success(successMessage);

      // Show individual failures if any
      if (result.totalFailed > 0) {
        const failedEmails = result.results
          .filter((r) => !r.success)
          .map((r) => r.email)
          .slice(0, 3) // Show max 3 failed emails
          .join(", ");

        toast.error(
          `Failed to send to: ${failedEmails}${
            result.totalFailed > 3 ? " and others" : ""
          }`
        );
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send inventory report");
    },
  });
}

// Send report to all active merchants (quick action)
export function useSendToAllMerchants() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { subject?: string; customMessage?: string }) => {
      const response = await apiClient.post<ApiResponse<SendReportResponse>>(
        "/reports/send-to-merchants",
        data
      );
      return response.data;
    },
    onSuccess: (result) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["email-logs"] });
      queryClient.invalidateQueries({ queryKey: ["reports", "stats"] });

      toast.success(
        `📧 Report sent to all ${result.recipientCount} active merchants!`
      );

      if (result.totalFailed > 0) {
        toast.warning(
          `${result.totalFailed} emails failed to send. Check email logs for details.`
        );
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send report to merchants");
    },
  });
}

// Get report statistics for dashboard
export function useReportStats() {
  return useQuery({
    queryKey: ["reports", "stats"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<ReportStats>>(
        "/reports/stats"
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refresh every 10 minutes
  });
}

// Download report as CSV
export function useDownloadReport() {
  return useMutation({
    mutationFn: async (format: "csv" | "json" = "csv") => {
      const response = await apiClient.get<ApiResponse<string>>(
        `/reports/inventory?format=${format}`
      );

      // Create and trigger download
      const blob = new Blob([response.data], {
        type: format === "csv" ? "text/csv" : "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `inventory-report-${
        new Date().toISOString().split("T")[0]
      }.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return response.data;
    },
    onSuccess: (_, format) => {
      toast.success(
        `📥 Inventory report downloaded as ${format.toUpperCase()}`
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to download report");
    },
  });
}

// Bulk email validation helper
export function useValidateEmails() {
  return useMutation({
    mutationFn: async (emails: string[]) => {
      // Client-side email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const results = emails.map((email) => ({
        email: email.trim(),
        isValid: emailRegex.test(email.trim()),
      }));

      const validEmails = results.filter((r) => r.isValid).map((r) => r.email);
      const invalidEmails = results
        .filter((r) => !r.isValid)
        .map((r) => r.email);

      return {
        validEmails,
        invalidEmails,
        totalCount: emails.length,
        validCount: validEmails.length,
        invalidCount: invalidEmails.length,
      };
    },
    onSuccess: (result) => {
      if (result.invalidCount > 0) {
        toast.warning(
          `${result.invalidCount} invalid email(s) found and will be skipped`
        );
      }
    },
  });
}
