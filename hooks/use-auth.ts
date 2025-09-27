import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/auth";
import { LoginRequest, LoginResponse, ApiResponse, User } from "@/types";

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    setAuth,
    setLoading,
    logout: logoutStore,
    initializeAuth,
  } = useAuthStore();

  // Initialize auth state from localStorage on mount
  React.useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Check authentication status - only if we have a token but no user
  const { data: authData } = useQuery({
    queryKey: ["auth", "profile"],
    queryFn: async () => {
      try {
        const response = await apiClient.get<ApiResponse<User>>(
          "/auth/profile"
        );
        return response.data;
      } catch (error) {
        // If profile fetch fails, clear auth state
        logoutStore();
        throw error;
      }
    },
    enabled: !!token && !user && !isLoading, // Only run if we have token but no user
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Set user data when auth query succeeds
  React.useEffect(() => {
    if (authData && token) {
      setAuth(authData, token);
    }
  }, [authData, token, setAuth]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const response = await apiClient.post<LoginResponse>(
        "/auth/login",
        credentials
      );
      return response;
    },
    onSuccess: (response) => {
      const { user, token } = response.data;
      setAuth(user, token);

      // Invalidate and refetch all queries
      queryClient.invalidateQueries();

      toast.success("Login successful");
      router.push("/dashboard");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Login failed");
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Call backend logout endpoint if available
      try {
        await apiClient.post("/auth/logout");
      } catch (error) {
        // Continue with logout even if backend call fails
        console.warn("Backend logout failed:", error);
      }
    },
    onSuccess: () => {
      logoutStore();
      queryClient.clear();
      toast.success("Logged out successfully");
      router.push("/login");
    },
    onError: () => {
      // Force logout even if backend call fails
      logoutStore();
      queryClient.clear();
      router.push("/login");
    },
  });

  const login = (credentials: LoginRequest) => {
    loginMutation.mutate(credentials);
  };

  const logout = () => {
    logoutMutation.mutate();
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading: isLoading || loginMutation.isPending,
    login,
    logout,
    isLoginPending: loginMutation.isPending,
    isLogoutPending: logoutMutation.isPending,
  };
}
