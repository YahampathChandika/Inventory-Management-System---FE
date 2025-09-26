import { create } from "zustand";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  hasPermission: (requiredRole: "Admin" | "Manager" | "Viewer") => boolean;
  isAdmin: () => boolean;
  isManager: () => boolean;
  isViewer: () => boolean;
}

const roleHierarchy = {
  Admin: 3,
  Manager: 2,
  Viewer: 1,
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      isLoading: false,
    }),

  setLoading: (isLoading) => set({ isLoading }),

  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    }),

  hasPermission: (requiredRole) => {
    const { user } = get();
    if (!user) return false;

    const userRoleLevel = roleHierarchy[user.role.name];
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
