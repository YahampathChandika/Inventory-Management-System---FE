import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";
import {
  User,
  Role,
  PaginatedResponse,
  ApiResponse,
  UserQueryParams,
} from "@/types";

// Extended types for user management
export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  roleId: number;
  isActive?: boolean;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  roleId?: number;
  isActive?: boolean;
}

export interface UpdateUserStatusRequest {
  isActive: boolean;
}

// Get paginated users
export function useUsers(params: UserQueryParams = {}) {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.search) queryParams.append("search", params.search);
  if (params.role) queryParams.append("role", params.role);
  if (params.status) queryParams.append("status", params.status);

  return useQuery({
    queryKey: ["users", params],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<User>>(
        `/users?${queryParams.toString()}`
      );
      return response;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Get single user
export function useUser(id: number | null) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: async () => {
      if (!id) throw new Error("ID is required");
      const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

// Get all roles for dropdowns
export function useRoles() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Role[]>>("/roles");
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (roles don't change often)
  });
}

// Create user
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUserRequest) => {
      const response = await apiClient.post<ApiResponse<User>>("/users", data);
      return response.data;
    },
    onSuccess: (newUser) => {
      // Invalidate users queries
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(`User "${newUser.username}" created successfully`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create user");
    },
  });
}

// Update user
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: UpdateUserRequest;
    }) => {
      const response = await apiClient.put<ApiResponse<User>>(
        `/users/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: (updatedUser) => {
      // Update specific user in cache
      queryClient.setQueryData(["users", updatedUser.id], updatedUser);
      // Invalidate users lists
      queryClient.invalidateQueries({ queryKey: ["users"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(`User "${updatedUser.username}" updated successfully`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update user");
    },
  });
}

// Update user status (enable/disable)
export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const response = await apiClient.patch<ApiResponse<User>>(
        `/users/${id}/status`,
        { isActive }
      );
      return response.data;
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["users", updatedUser.id], updatedUser);
      queryClient.invalidateQueries({ queryKey: ["users"], exact: false });
      toast.success(
        `User "${updatedUser.username}" ${
          updatedUser.isActive ? "enabled" : "disabled"
        } successfully`
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update user status");
    },
  });
}

// Delete user
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete<ApiResponse<any>>(`/users/${id}`);
      return response;
    },
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ["users", deletedId] });
      // Invalidate users lists
      queryClient.invalidateQueries({ queryKey: ["users"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("User deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete user");
    },
  });
}

// Get user statistics for dashboard
export function useUserStats() {
  return useQuery({
    queryKey: ["users", "stats"],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<User>>(
        "/users?limit=1"
      );

      // Get breakdown by role and status
      const [
        adminUsers,
        managerUsers,
        viewerUsers,
        activeUsers,
        inactiveUsers,
      ] = await Promise.all([
        apiClient.get<PaginatedResponse<User>>("/users?limit=1&role=Admin"),
        apiClient.get<PaginatedResponse<User>>("/users?limit=1&role=Manager"),
        apiClient.get<PaginatedResponse<User>>("/users?limit=1&role=Viewer"),
        apiClient.get<PaginatedResponse<User>>("/users?limit=1&status=active"),
        apiClient.get<PaginatedResponse<User>>(
          "/users?limit=1&status=inactive"
        ),
      ]);

      return {
        total: response.pagination.total,
        adminCount: adminUsers.pagination.total,
        managerCount: managerUsers.pagination.total,
        viewerCount: viewerUsers.pagination.total,
        activeCount: activeUsers.pagination.total,
        inactiveCount: inactiveUsers.pagination.total,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
