import { create } from "zustand";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setAuth: (user: User, token: string) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  hasPermission: (requiredRole: "Admin" | "Manager" | "Viewer") => boolean;
  isAdmin: () => boolean;
  isManager: () => boolean;
  isViewer: () => boolean;
  initializeAuth: () => void;
}

const roleHierarchy = {
  Admin: 3,
  Manager: 2,
  Viewer: 1,
};

// Token storage utilities
const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

// Cookie utilities for server-side access
const setCookie = (name: string, value: string, days: number = 1) => {
  if (typeof document === "undefined") return;

  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

const deleteCookie = (name: string) => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/;SameSite=Lax`;
};

const getStoredToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
};

const getStoredUser = (): User | null => {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem(USER_KEY);
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

const setStoredToken = (token: string | null): void => {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    // Also set as cookie for middleware access
    setCookie(TOKEN_KEY, token, 1); // 1 day expiration
  } else {
    localStorage.removeItem(TOKEN_KEY);
    deleteCookie(TOKEN_KEY);
  }
};

const setStoredUser = (user: User | null): void => {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => {
    setStoredUser(user);
    set({
      user,
      isAuthenticated: !!user,
    });
  },

  setToken: (token) => {
    setStoredToken(token);
    set({ token });
  },

  setAuth: (user, token) => {
    setStoredUser(user);
    setStoredToken(token);
    set({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  setLoading: (isLoading) => set({ isLoading }),

  logout: () => {
    setStoredToken(null);
    setStoredUser(null);
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  initializeAuth: () => {
    const storedToken = getStoredToken();
    const storedUser = getStoredUser();

    if (storedToken && storedUser) {
      // Verify token is still valid (optional)
      const isValidToken = isTokenValid(storedToken);

      if (isValidToken) {
        set({
          user: storedUser,
          token: storedToken,
          isAuthenticated: true,
          isLoading: false,
        });

        // Ensure cookie is set for middleware
        setCookie(TOKEN_KEY, storedToken, 1);
      } else {
        // Token expired, clear everything
        get().logout();
      }
    } else {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  hasPermission: (requiredRole) => {
    const { user } = get();
    if (!user) return false;

    const userRoleLevel =
      roleHierarchy[user.role.name as keyof typeof roleHierarchy];
    const requiredRoleLevel = roleHierarchy[requiredRole];

    return userRoleLevel >= requiredRoleLevel;
  },

  isAdmin: () => {
    const { user } = get();
    return user?.role.name === "Admin";
  },

  isManager: () => {
    const { user } = get();
    return user?.role.name === "Manager" || user?.role.name === "Admin";
  },

  isViewer: () => {
    const { user } = get();
    return !!user; // All authenticated users can view
  },
}));

// Helper function to check if token is valid (optional)
function isTokenValid(token: string): boolean {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));

    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp > currentTime;
  } catch {
    return false;
  }
}
