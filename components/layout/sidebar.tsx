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
import { getNavigationItems } from "@/lib/navigation";
import { usePermissions } from "@/components/auth";
import { cn } from "@/lib/utils";
import { Package } from "lucide-react";

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
  const { getAllPermissions } = usePermissions();

  // Get user permissions and filter navigation items
  const userPermissions = getAllPermissions();
  const visibleNavItems = getNavigationItems(userPermissions);

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
                "w-full gap-3 h-10 transition-colors justify-center",
                isCollapsed && !isMobile ? "px-2" : "px-3",
                isActive && "bg-secondary font-medium",
                !isActive && "hover:bg-muted/50"
              )}
              asChild
            >
              <Link href={item.href} onClick={handleNavClick}>
                <Icon className="h-5 w-5 flex-shrink-0" />
                {(!isCollapsed || isMobile) && (
                  <div className="flex items-center justify-between w-full min-w-0">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-2">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                )}
              </Link>
            </Button>
          );

          // Show tooltip when collapsed (desktop only)
          if (isCollapsed && !isMobile) {
            return (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>{navButton}</TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="flex items-center gap-2"
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <Badge variant="secondary">{item.badge}</Badge>
                  )}
                  {item.description && (
                    <span className="text-xs text-muted-foreground">
                      • {item.description}
                    </span>
                  )}
                </TooltipContent>
              </Tooltip>
            );
          }

          return <div key={item.href}>{navButton}</div>;
        })}
      </nav>

      {/* Footer - Optional branding or version info */}
      {(!isCollapsed || isMobile) && (
        <div className="p-4 border-t">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Version 1.0.0</p>
          </div>
        </div>
      )}
    </div>
  );

  // Wrap with TooltipProvider for desktop collapsed state
  if (!isMobile) {
    return <TooltipProvider>{sidebarContent}</TooltipProvider>;
  }

  return sidebarContent;
}
