import {
  LayoutDashboard,
  Package,
  Users,
  Store,
  Mail,
  Settings,
  User,
  Shield,
  LucideIcon,
} from "lucide-react";
import { Permission } from "@/lib/permissions";

export interface NavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
  permission: Permission;
  description?: string;
  badge?: string; // Optional badge for notifications
  isExternal?: boolean; // For external links
}

export interface NavigationGroup {
  label: string;
  items: NavigationItem[];
}

// Main navigation items
export const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    permission: "dashboard.view",
    description: "Overview and statistics",
  },
  {
    label: "Inventory",
    href: "/dashboard/inventory",
    icon: Package,
    permission: "inventory.view",
    description: "Manage inventory items",
  },
  {
    label: "Merchants",
    href: "/dashboard/merchants",
    icon: Store,
    permission: "merchants.view",
    description: "Manage merchant contacts",
  },
  {
    label: "Reports",
    href: "/dashboard/reports",
    icon: Mail,
    permission: "reports.view",
    description: "Send inventory reports",
  },
  {
    label: "Users",
    href: "/dashboard/users",
    icon: Users,
    permission: "users.view",
    description: "Manage system users",
  },
];

// Grouped navigation (alternative structure for complex apps)
export const navigationGroups: NavigationGroup[] = [
  {
    label: "Main",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        permission: "dashboard.view",
        description: "Overview and statistics",
      },
    ],
  },
  {
    label: "Management",
    items: [
      {
        label: "Inventory",
        href: "/dashboard/inventory",
        icon: Package,
        permission: "inventory.view",
        description: "Manage inventory items",
      },
      {
        label: "Merchants",
        href: "/dashboard/merchants",
        icon: Store,
        permission: "merchants.view",
        description: "Manage merchant contacts",
      },
    ],
  },
  {
    label: "Administration",
    items: [
      {
        label: "Users",
        href: "/dashboard/users",
        icon: Users,
        permission: "users.view",
        description: "Manage system users",
      },
      {
        label: "Reports",
        href: "/dashboard/reports",
        icon: Mail,
        permission: "reports.view",
        description: "Send inventory reports",
      },
    ],
  },
];

// User menu items (profile, settings, etc.)
export const userMenuItems = [
  {
    label: "Profile",
    href: "/dashboard/profile",
    icon: User,
    permission: "profile.view" as Permission,
    description: "Manage your profile",
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    permission: "profile.view" as Permission,
    description: "Account settings",
  },
];

// Quick action items (for dashboard quick actions)
export const quickActionItems = [
  {
    label: "Add Inventory Item",
    href: "/dashboard/inventory/new",
    icon: Package,
    permission: "inventory.create" as Permission,
    description: "Create new inventory item",
  },
  {
    label: "Add User",
    href: "/dashboard/users/new",
    icon: Users,
    permission: "users.create" as Permission,
    description: "Create new user account",
  },
  {
    label: "Add Merchant",
    href: "/dashboard/merchants/new",
    icon: Store,
    permission: "merchants.create" as Permission,
    description: "Add new merchant contact",
  },
  {
    label: "Send Report",
    href: "/dashboard/reports",
    icon: Mail,
    permission: "reports.send" as Permission,
    description: "Send inventory report via email",
  },
];

// Admin-specific navigation items
export const adminNavigationItems: NavigationItem[] = [
  {
    label: "System Settings",
    href: "/dashboard/admin/settings",
    icon: Settings,
    permission: "users.view", // Reusing admin permission
    description: "System configuration",
  },
  {
    label: "Audit Logs",
    href: "/dashboard/admin/audit",
    icon: Shield,
    permission: "users.view", // Reusing admin permission
    description: "View system audit logs",
  },
];

// Helper functions for navigation filtering and management
export function getNavigationItems(
  permissions: Permission[]
): NavigationItem[] {
  return navigationItems.filter((item) =>
    permissions.includes(item.permission)
  );
}

export function getQuickActions(permissions: Permission[]): NavigationItem[] {
  return quickActionItems.filter((item) =>
    permissions.includes(item.permission)
  );
}

export function getNavigationGroups(
  permissions: Permission[]
): NavigationGroup[] {
  return navigationGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        permissions.includes(item.permission)
      ),
    }))
    .filter((group) => group.items.length > 0);
}

// Navigation metadata for SEO and breadcrumbs
export const navigationMetadata: Record<
  string,
  { title: string; description: string }
> = {
  "/dashboard": {
    title: "Dashboard",
    description: "Inventory management system overview and statistics",
  },
  "/dashboard/inventory": {
    title: "Inventory Management",
    description: "Manage your inventory items and stock levels",
  },
  "/dashboard/inventory/new": {
    title: "Add Inventory Item",
    description: "Create a new inventory item",
  },
  "/dashboard/users": {
    title: "User Management",
    description: "Manage system users and their permissions",
  },
  "/dashboard/users/new": {
    title: "Add User",
    description: "Create a new user account",
  },
  "/dashboard/merchants": {
    title: "Merchant Management",
    description: "Manage merchant contacts and information",
  },
  "/dashboard/merchants/new": {
    title: "Add Merchant",
    description: "Add a new merchant contact",
  },
  "/dashboard/reports": {
    title: "Reports",
    description: "Generate and send inventory reports",
  },
  "/dashboard/profile": {
    title: "Profile",
    description: "Manage your profile and account settings",
  },
};

// Breadcrumb generation helper
export function generateBreadcrumbs(
  pathname: string
): Array<{ label: string; href: string }> {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: Array<{ label: string; href: string }> = [];

  let currentPath = "";

  for (const segment of segments) {
    currentPath += `/${segment}`;

    // Find navigation item for this path
    const navItem =
      navigationItems.find((item) => item.href === currentPath) ||
      quickActionItems.find((item) => item.href === currentPath);

    if (navItem) {
      breadcrumbs.push({
        label: navItem.label,
        href: currentPath,
      });
    } else {
      // Handle dynamic routes or unknown paths
      const label = segment.charAt(0).toUpperCase() + segment.slice(1);
      breadcrumbs.push({
        label: label.replace("-", " "),
        href: currentPath,
      });
    }
  }

  return breadcrumbs;
}
