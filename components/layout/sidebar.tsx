"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuthStore } from "@/lib/store/auth";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Users,
  Store,
  Mail,
  Settings,
  LucideIcon,
} from "lucide-react";

interface NavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
  requiredRole: "Viewer" | "Manager" | "Admin";
}

interface SidebarProps {
  className?: string;
  isCollapsed?: boolean;
  isMobile?: boolean;
  onNavigate?: () => void; // For mobile sidebar to close after navigation
}

export function Sidebar({
  className,
  isCollapsed = false,
  isMobile = false,
  onNavigate,
}: SidebarProps) {
  const pathname = usePathname();
  const { hasPermission } = useAuthStore();

  // Define navigation items with role requirements
  const navigationItems: NavigationItem[] = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      description: "Overview and statistics",
      requiredRole: "Viewer", // All roles can access
    },
    {
      label: "Inventory",
      href: "/dashboard/inventory",
      icon: Package,
      description: "Manage inventory items",
      requiredRole: "Viewer", // All roles can view inventory
    },
    {
      label: "Merchants",
      href: "/dashboard/merchants",
      icon: Store,
      description: "Manage merchant contacts",
      requiredRole: "Manager", // Manager+ only
    },
    {
      label: "Reports",
      href: "/dashboard/reports",
      icon: Mail,
      description: "Send inventory reports",
      requiredRole: "Manager", // Manager+ only
    },
    {
      label: "Users",
      href: "/dashboard/users",
      icon: Users,
      description: "Manage system users",
      requiredRole: "Admin", // Admin only
    },
  ];

  // Filter navigation items based on user permissions
  const visibleNavItems = navigationItems.filter((item) =>
    hasPermission(item.requiredRole)
  );

  // Check if current path matches navigation item
  const isActiveRoute = (href: string) => {
    if (pathname === href) return true;

    // Handle nested routes (e.g., /dashboard/inventory/new should highlight /dashboard/inventory)
    if (href !== "/dashboard" && pathname.startsWith(href)) {
      return true;
    }

    return false;
  };

  const handleNavClick = () => {
    if (isMobile && onNavigate) {
      onNavigate();
    }
  };

  const sidebarContent = (
    <div
      className={cn(
        "flex flex-col h-full bg-background border-r",
        !isMobile && "transition-all duration-300 ease-in-out",
        !isMobile && (isCollapsed ? "w-16" : "w-64"),
        isMobile && "w-64",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b min-h-[4rem]">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Package className="h-5 w-5 text-primary" />
          </div>
          {(!isCollapsed || isMobile) && (
            <div className="min-w-0">
              <h1 className="font-semibold text-lg truncate">
                Inventory System
              </h1>
              <p className="text-xs text-muted-foreground truncate">
                Management Portal
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {visibleNavItems.map((item) => {
          const isActive = isActiveRoute(item.href);
          const Icon = item.icon;

          const navButton = (
            <Button
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full gap-3 h-10 transition-colors",
                isCollapsed && !isMobile
                  ? "justify-center px-2"
                  : "justify-start px-3"
              )}
              asChild
            >
              <Link href={item.href} onClick={handleNavClick}>
                <Icon className="h-4 w-4 flex-shrink-0" />
                {(!isCollapsed || isMobile) && (
                  <span className="truncate">{item.label}</span>
                )}
              </Link>
            </Button>
          );

          // Wrap with tooltip for collapsed state
          if (isCollapsed && !isMobile) {
            return (
              <TooltipProvider key={item.href}>
                <Tooltip>
                  <TooltipTrigger asChild>{navButton}</TooltipTrigger>
                  <TooltipContent side="right">
                    <div>
                      <p className="font-medium">{item.label}</p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          }

          return <div key={item.href}>{navButton}</div>;
        })}
      </nav>

      {/* Footer - User info when collapsed */}
      {isCollapsed && !isMobile && (
        <div className="p-4 border-t">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <span className="text-xs font-medium text-primary">
                    {useAuthStore
                      .getState()
                      .user?.username?.charAt(0)
                      .toUpperCase()}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <div>
                  <p className="font-medium">
                    {useAuthStore.getState().user?.username}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {useAuthStore.getState().user?.role.name}
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  );

  return sidebarContent;
}
