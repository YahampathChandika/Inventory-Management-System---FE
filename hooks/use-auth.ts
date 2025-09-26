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
    isAuthenticated,
    isLoading,
    setUser,
    setLoading,
    logout: logoutStore,
  } = useAuthStore();

  // Check authentication status
  const { data: authData } = useQuery({
    queryKey: ["auth", "profile"],
    queryFn: async () => {
      try {
        const response = await apiClient.get<ApiResponse<User>>(
          "/auth/profile"
        );
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    enabled: !isAuthenticated && !user,
    retry: false,
    staleTime: Infinity,
  });

  // Set user data when auth query succeeds
  React.useEffect(() => {
    if (authData) {
      setUser(authData);
    } else if (!isLoading) {
      setUser(null);
    }
  }, [authData, setUser, isLoading]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const response = await apiClient.post<LoginResponse>(
        "/auth/login",
        credentials
      );
      return response;
    },
    onSuccess: (data) => {
      setUser(data.data.user);
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
    isAuthenticated,
    isLoading: isLoading || loginMutation.isPending,
    login,
    logout,
    isLoginPending: loginMutation.isPending,
    isLogoutPending: logoutMutation.isPending,
  };
}

// You'll need to add this import at the top
import React from "react";
