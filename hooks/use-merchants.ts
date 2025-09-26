import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";
import {
  Merchant,
  CreateMerchant,
  PaginatedResponse,
  ApiResponse,
  MerchantQueryParams,
} from "@/types";

// Extended types for merchant management
export interface UpdateMerchantRequest {
  name?: string;
  email?: string;
  isActive?: boolean;
}

export interface BulkImportRequest {
  emails: string;
  defaultName?: string;
}

export interface BulkImportResponse {
  imported: number;
  skipped: number;
  errors: string[];
}

// Get paginated merchants
export function useMerchants(params: MerchantQueryParams = {}) {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.search) queryParams.append("search", params.search);
  if (params.status) queryParams.append("status", params.status);

  return useQuery({
    queryKey: ["merchants", params],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Merchant>>(
        `/merchants?${queryParams.toString()}`
      );
      return response;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Get single merchant
export function useMerchant(id: number | null) {
  return useQuery({
    queryKey: ["merchants", id],
    queryFn: async () => {
      if (!id) throw new Error("ID is required");
      const response = await apiClient.get<ApiResponse<Merchant>>(
        `/merchants/${id}`
      );
      return response.data;
    },
    enabled: !!id,
  });
}

// Create merchant
export function useCreateMerchant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateMerchant) => {
      const response = await apiClient.post<ApiResponse<Merchant>>(
        "/merchants",
        data
      );
      return response.data;
    },
    onSuccess: (newMerchant) => {
      // Invalidate merchants queries
      queryClient.invalidateQueries({ queryKey: ["merchants"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(`Merchant "${newMerchant.name}" created successfully`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create merchant");
    },
  });
}

// Update merchant
export function useUpdateMerchant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: UpdateMerchantRequest;
    }) => {
      const response = await apiClient.put<ApiResponse<Merchant>>(
        `/merchants/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: (updatedMerchant) => {
      // Update specific merchant in cache
      queryClient.setQueryData(
        ["merchants", updatedMerchant.id],
        updatedMerchant
      );
      // Invalidate merchants lists
      queryClient.invalidateQueries({ queryKey: ["merchants"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(`Merchant "${updatedMerchant.name}" updated successfully`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update merchant");
    },
  });
}

// Delete merchant
export function useDeleteMerchant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete<ApiResponse<any>>(
        `/merchants/${id}`
      );
      return response;
    },
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ["merchants", deletedId] });
      // Invalidate merchants lists
      queryClient.invalidateQueries({ queryKey: ["merchants"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Merchant deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete merchant");
    },
  });
}

// Bulk import merchants
export function useBulkImportMerchants() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BulkImportRequest) => {
      const response = await apiClient.post<ApiResponse<BulkImportResponse>>(
        "/merchants/bulk-import",
        data
      );
      return response.data;
    },
    onSuccess: (result) => {
      // Invalidate merchants queries
      queryClient.invalidateQueries({ queryKey: ["merchants"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });

      // Show detailed success message
      if (result.imported > 0) {
        toast.success(
          `Successfully imported ${result.imported} merchants${
            result.skipped > 0 ? `, skipped ${result.skipped}` : ""
          }`
        );
      }

      // Show errors if any
      if (result.errors.length > 0) {
        result.errors.forEach((error) => {
          toast.error(error);
        });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to import merchants");
    },
  });
}

// Get merchant statistics for dashboard
export function useMerchantStats() {
  return useQuery({
    queryKey: ["merchants", "stats"],
    queryFn: async () => {
      const [allMerchants, activeMerchants, inactiveMerchants] =
        await Promise.all([
          apiClient.get<PaginatedResponse<Merchant>>("/merchants?limit=1"),
          apiClient.get<PaginatedResponse<Merchant>>(
            "/merchants?limit=1&status=active"
          ),
          apiClient.get<PaginatedResponse<Merchant>>(
            "/merchants?limit=1&status=inactive"
          ),
        ]);

      return {
        total: allMerchants.pagination.total,
        activeCount: activeMerchants.pagination.total,
        inactiveCount: inactiveMerchants.pagination.total,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get all active merchants for email sending
export function useActiveMerchants() {
  return useQuery({
    queryKey: ["merchants", "active"],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Merchant>>(
        "/merchants?status=active&limit=1000"
      );
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Get merchants by IDs (for email recipient selection)
export function useMerchantsByIds(ids: number[]) {
  return useQuery({
    queryKey: ["merchants", "byIds", ids],
    queryFn: async () => {
      if (ids.length === 0) return [];

      // Fetch merchants by IDs (you might need to implement this endpoint or fetch individually)
      const promises = ids.map((id) =>
        apiClient.get<ApiResponse<Merchant>>(`/merchants/${id}`)
      );

      const responses = await Promise.all(promises);
      return responses.map((response) => response.data);
    },
    enabled: ids.length > 0,
  });
}
