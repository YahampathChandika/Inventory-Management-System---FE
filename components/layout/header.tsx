"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/lib/store/auth";
import { useTheme } from "next-themes";
import {
  User,
  LogOut,
  Sun,
  Moon,
  Monitor,
  Settings,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Bell,
} from "lucide-react";
import Link from "next/link";
import { usePermissions } from "@/components/auth";
import { MobileSidebar } from "./mobile-sidebar";

interface HeaderProps {
  title?: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Header({ title, isCollapsed, onToggleCollapse }: HeaderProps) {
  const { logout } = useAuth();
  const { user } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const { canAccess } = usePermissions();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button - Only visible on mobile */}
          <div className="md:hidden">
            <MobileSidebar />
          </div>

          {/* Desktop Sidebar Toggle - Only visible on desktop */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="hidden md:flex h-9 w-9"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>

          {/* Page Title */}
          <div className="min-w-0">
            {title && (
              <h1 className="text-xl md:text-2xl font-semibold truncate">
                {title}
              </h1>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="mr-2 h-4 w-4" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="mr-2 h-4 w-4" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Monitor className="mr-2 h-4 w-4" />
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="relative h-9 w-9 rounded-full"
              >
                <div className="h-7 w-7 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-primary">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.username}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    Role: {user?.role.name}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Profile Settings */}
              {canAccess("profile.view") && (
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
              )}

              {/* Settings - Admin only */}
              {canAccess("users.view") && (
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              {/* Logout */}
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
