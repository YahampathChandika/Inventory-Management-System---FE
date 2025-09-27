import { QueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store/auth";
import { toast } from "sonner";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: (failureCount, error) => {
        // Don't retry on 401 errors
        if ((error as any)?.message?.includes("Unauthorized")) {
          return false;
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: (failureCount, error) => {
        // Don't retry on 401 errors
        if ((error as any)?.message?.includes("Unauthorized")) {
          return false;
        }
        return failureCount < 2;
      },
      onError: (error) => {
        // Global error handling for mutations
        if ((error as any)?.message?.includes("Unauthorized")) {
          // Let the auth system handle logout
          const { logout } = useAuthStore.getState();
          logout();
          toast.error("Session expired. Please login again.");
        }
      },
    },
  },
});
