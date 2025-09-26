import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { ApiResponse, InventoryItem, PaginatedResponse } from "@/types";

interface DashboardStats {
  totalItems: number;
  lowStockItems: number;
  totalValue: number;
  recentItems: InventoryItem[];
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: async (): Promise<DashboardStats> => {
      // Get inventory data to calculate stats
      const response = await apiClient.get<PaginatedResponse<InventoryItem>>(
        "/inventory?limit=100"
      );
      const items = response.data;

      // Calculate stats
      const totalItems = response.pagination.total;
      const lowStockItems = items.filter((item) => item.quantity <= 10).length;
      const totalValue = items.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0
      );
      const recentItems = items
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5);

      return {
        totalItems,
        lowStockItems,
        totalValue,
        recentItems,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useQuickStats() {
  return useQuery({
    queryKey: ["dashboard", "quick-stats"],
    queryFn: async () => {
      try {
        // Fetch basic inventory count
        const inventoryResponse = await apiClient.get<
          PaginatedResponse<InventoryItem>
        >("/inventory?limit=1");

        let userCount = 0;
        let merchantCount = 0;

        try {
          // Try to fetch user count (Admin only)
          const userResponse = await apiClient.get<any>("/users?limit=1");
          userCount = userResponse.pagination?.total || 0;
        } catch (error) {
          // User doesn't have permission, ignore
        }

        try {
          // Try to fetch merchant count (Manager+ only)
          const merchantResponse = await apiClient.get<any>(
            "/merchants?limit=1"
          );
          merchantCount = merchantResponse.pagination?.total || 0;
        } catch (error) {
          // User doesn't have permission, ignore
        }

        return {
          inventoryCount: inventoryResponse.pagination.total,
          userCount,
          merchantCount,
        };
      } catch (error) {
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}
