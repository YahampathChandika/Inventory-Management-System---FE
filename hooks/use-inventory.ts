import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";
import {
  InventoryItem,
  CreateInventoryItem,
  UpdateInventoryItem,
  PaginatedResponse,
  ApiResponse,
  InventoryQueryParams,
} from "@/types";

// Get paginated inventory items
export function useInventory(params: InventoryQueryParams = {}) {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.search) queryParams.append("search", params.search);
  if (params.sort) queryParams.append("sort", params.sort);
  if (params.order) queryParams.append("order", params.order);

  return useQuery({
    queryKey: ["inventory", params],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<InventoryItem>>(
        `/inventory?${queryParams.toString()}`
      );
      return response;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Get single inventory item
export function useInventoryItem(id: number | null) {
  return useQuery({
    queryKey: ["inventory", id],
    queryFn: async () => {
      if (!id) throw new Error("ID is required");
      const response = await apiClient.get<ApiResponse<InventoryItem>>(
        `/inventory/${id}`
      );
      return response.data;
    },
    enabled: !!id,
  });
}

// Search inventory items
export function useInventorySearch(query: string, limit: number = 10) {
  return useQuery({
    queryKey: ["inventory", "search", query],
    queryFn: async () => {
      if (!query.trim()) return [];
      const response = await apiClient.get<ApiResponse<InventoryItem[]>>(
        `/search/inventory?q=${encodeURIComponent(query)}&limit=${limit}`
      );
      return response.data;
    },
    enabled: query.trim().length > 0,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Create inventory item
export function useCreateInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateInventoryItem) => {
      const response = await apiClient.post<ApiResponse<InventoryItem>>(
        "/inventory",
        data
      );
      return response.data;
    },
    onSuccess: (newItem) => {
      // Invalidate inventory queries
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Inventory item created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create inventory item");
    },
  });
}

// Update inventory item
export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: UpdateInventoryItem;
    }) => {
      const response = await apiClient.put<ApiResponse<InventoryItem>>(
        `/inventory/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: (updatedItem) => {
      // Update specific item in cache
      queryClient.setQueryData(["inventory", updatedItem.id], updatedItem);
      // Invalidate inventory lists
      queryClient.invalidateQueries({ queryKey: ["inventory"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Inventory item updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update inventory item");
    },
  });
}

// Update only quantity
export function useUpdateInventoryQuantity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      const response = await apiClient.patch<ApiResponse<InventoryItem>>(
        `/inventory/${id}/quantity`,
        { quantity }
      );
      return response.data;
    },
    onSuccess: (updatedItem) => {
      queryClient.setQueryData(["inventory", updatedItem.id], updatedItem);
      queryClient.invalidateQueries({ queryKey: ["inventory"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Quantity updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update quantity");
    },
  });
}

// Delete inventory item
export function useDeleteInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete<ApiResponse<any>>(
        `/inventory/${id}`
      );
      return response;
    },
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ["inventory", deletedId] });
      // Invalidate inventory lists
      queryClient.invalidateQueries({ queryKey: ["inventory"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Inventory item deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete inventory item");
    },
  });
}

// Bulk operations (if needed)
export function useBulkUpdateInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      updates: Array<{ id: number; data: Partial<UpdateInventoryItem> }>
    ) => {
      const promises = updates.map(({ id, data }) =>
        apiClient.put<ApiResponse<InventoryItem>>(`/inventory/${id}`, data)
      );
      const responses = await Promise.all(promises);
      return responses.map((response) => response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Bulk update completed successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Bulk update failed");
    },
  });
}
