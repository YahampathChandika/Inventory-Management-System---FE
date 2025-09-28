import { create } from "zustand";
import Cookies from "js-cookie";
import { User } from "@/types";
import { apiClient } from "@/lib/api/client";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => void;
  initializeAuth: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  hasPermission: (requiredRole: "Admin" | "Manager" | "Viewer") => boolean;
}

type AuthStore = AuthState & AuthActions;

// Cookie configuration
const COOKIE_OPTIONS = {
  secure: process.env.NODE_ENV === "production", // Only HTTPS in production
  sameSite: "lax" as const, // CSRF protection
  expires: 1, // 1 day
  path: "/", // Available across the app
};

const TOKEN_COOKIE_NAME = "auth_token";
const USER_COOKIE_NAME = "auth_user";

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Initial state
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  // Actions
  login: async (credentials) => {
    try {
      set({ isLoading: true });

      interface LoginResponse {
        data: {
          user: User;
          token: string;
        };
      }

      const response = await apiClient.post<LoginResponse>(
        "/auth/login",
        credentials
      );
      const { user, token } = response.data;

      // Store in cookies
      Cookies.set(TOKEN_COOKIE_NAME, token, COOKIE_OPTIONS);
      Cookies.set(USER_COOKIE_NAME, JSON.stringify(user), COOKIE_OPTIONS);

      // Update store
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
      throw error;
    }
  },

  logout: () => {
    // Remove cookies
    Cookies.remove(TOKEN_COOKIE_NAME, { path: "/" });
    Cookies.remove(USER_COOKIE_NAME, { path: "/" });

    // Clear store
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });

    // Redirect to login
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  },

  initializeAuth: async () => {
    try {
      set({ isLoading: true });

      // Get token from cookies
      const token = Cookies.get(TOKEN_COOKIE_NAME);
      const userJson = Cookies.get(USER_COOKIE_NAME);

      if (!token || !userJson) {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
        return;
      }

      // Parse user data
      let user: User;
      try {
        user = JSON.parse(userJson);
      } catch (parseError) {
        // Invalid user data in cookie, clear everything
        Cookies.remove(TOKEN_COOKIE_NAME, { path: "/" });
        Cookies.remove(USER_COOKIE_NAME, { path: "/" });
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
        return;
      }

      // Validate token by fetching current user profile
      try {
        const response = await apiClient.get<{ data: User }>("/auth/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const currentUser = response.data;

        // Update user data in case it changed
        Cookies.set(
          USER_COOKIE_NAME,
          JSON.stringify(currentUser),
          COOKIE_OPTIONS
        );

        set({
          user: currentUser,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error) {
        // Token is invalid, clear everything
        Cookies.remove(TOKEN_COOKIE_NAME, { path: "/" });
        Cookies.remove(USER_COOKIE_NAME, { path: "/" });
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("Error initializing auth:", error);
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  updateUser: (userData) => {
    const currentUser = get().user;
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };

      // Update cookie
      Cookies.set(
        USER_COOKIE_NAME,
        JSON.stringify(updatedUser),
        COOKIE_OPTIONS
      );

      // Update store
      set({ user: updatedUser });
    }
  },

  hasPermission: (requiredRole) => {
    const { user } = get();
    if (!user) return false;

    const roleHierarchy = {
      Viewer: 1,
      Manager: 2,
      Admin: 3,
    };

    const userLevel =
      roleHierarchy[user.role.name as keyof typeof roleHierarchy] || 0;
    const requiredLevel = roleHierarchy[requiredRole];

    return userLevel >= requiredLevel;
  },
}));
