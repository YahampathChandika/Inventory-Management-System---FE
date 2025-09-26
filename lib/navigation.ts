import {
  LayoutDashboard,
  Package,
  Users,
  Store,
  Mail,
  Settings,
  LucideIcon,
} from "lucide-react";

export interface NavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
  requiredRole: "Admin" | "Manager" | "Viewer";
  description?: string;
}

export const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    requiredRole: "Viewer",
    description: "Overview and statistics",
  },
  {
    label: "Inventory",
    href: "/inventory",
    icon: Package,
    requiredRole: "Viewer",
    description: "Manage inventory items",
  },
  {
    label: "Users",
    href: "/users",
    icon: Users,
    requiredRole: "Admin",
    description: "Manage system users",
  },
  {
    label: "Merchants",
    href: "/merchants",
    icon: Store,
    requiredRole: "Manager",
    description: "Manage merchant contacts",
  },
  {
    label: "Reports",
    href: "/reports",
    icon: Mail,
    requiredRole: "Manager",
    description: "Send inventory reports",
  },
];

export const userMenuItems = [
  {
    label: "Profile",
    href: "/profile",
    icon: Settings,
  },
];
