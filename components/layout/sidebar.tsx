"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/auth";
import { navigationItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Package } from "lucide-react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { hasPermission, user } = useAuthStore();

  const filteredNavItems = navigationItems.filter((item) =>
    hasPermission(item.requiredRole)
  );

  return (
    <div
      className={cn(
        "relative flex flex-col border-r bg-background transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b">
        <div className="flex items-center gap-2 min-w-0">
          <Package className="h-6 w-6 text-primary flex-shrink-0" />
          {!isCollapsed && (
            <h1 className="font-semibold text-lg truncate">Inventory</h1>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-10",
                  isCollapsed && "px-2",
                  isActive && "bg-secondary"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      {!isCollapsed && (
        <div className="p-4 border-t">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {user?.username?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{user?.username}</p>
              <p className="text-xs text-muted-foreground">{user?.role.name}</p>
            </div>
          </div>
        </div>
      )}

      {/* Collapse Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-20 h-8 w-8 border bg-background shadow-md"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
