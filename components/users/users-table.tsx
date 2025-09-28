"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  useUsers,
  useDeleteUser,
  useUpdateUserStatus,
  useRoles,
} from "@/hooks/use-users";
import { useAuthStore } from "@/lib/store/auth";
import { UserQueryParams } from "@/types";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Search,
  Plus,
  Users,
  AlertTriangle,
  Loader2,
  Shield,
  CheckCircle,
  XCircle,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

interface UsersTableProps {
  searchable?: boolean;
  showActions?: boolean;
}

export function UsersTable({
  searchable = true,
  showActions = true,
}: UsersTableProps) {
  const [queryParams, setQueryParams] = useState<UserQueryParams>({
    page: 1,
    limit: 10,
    search: "",
    role: "",
    status: undefined,
  });

  const { user: currentUser } = useAuthStore();
  const { data, isLoading, error } = useUsers(queryParams);
  const { data: roles } = useRoles();
  const deleteUserMutation = useDeleteUser();
  const updateStatusMutation = useUpdateUserStatus();

  const handleSearch = (search: string) => {
    setQueryParams((prev) => ({
      ...prev,
      search,
      page: 1,
    }));
  };

  const handleRoleFilter = (role: string) => {
    setQueryParams((prev) => ({
      ...prev,
      role: role === "all" ? "" : role,
      page: 1,
    }));
  };

  const handleStatusFilter = (status: string) => {
    setQueryParams((prev: any) => ({
      ...prev,
      status: status === "all" ? "" : status,
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setQueryParams((prev) => ({ ...prev, page }));
  };

  const handleDelete = async (id: number, username: string) => {
    if (id === currentUser?.id) {
      toast.error("You cannot delete your own account");
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to delete user "${username}"? This action cannot be undone.`
      )
    ) {
      deleteUserMutation.mutate(id);
    }
  };

  const handleStatusToggle = async (
    id: number,
    username: string,
    currentStatus: boolean
  ) => {
    if (id === currentUser?.id && currentStatus) {
      toast.error("You cannot disable your own account");
      return;
    }

    const newStatus = !currentStatus;
    const action = newStatus ? "enable" : "disable";

    if (
      window.confirm(`Are you sure you want to ${action} user "${username}"?`)
    ) {
      updateStatusMutation.mutate({ id, isActive: newStatus });
    }
  };

  const getRoleBadgeVariant = (roleName: string) => {
    switch (roleName) {
      case "Admin":
        return "destructive" as const;
      case "Manager":
        return "default" as const;
      case "Viewer":
        return "secondary" as const;
      default:
        return "outline" as const;
    }
  };

  const formatLastLogin = (lastLogin: string | null) => {
    if (!lastLogin) return "Never";
    return new Date(lastLogin).toLocaleDateString();
  };

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Failed to load users
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Users</h2>
          <p className="text-muted-foreground">
            {data?.pagination.total || 0} users total
          </p>
        </div>

        <Link href="/dashboard/users/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </Link>
      </div>

      {/* Filters */}
      {searchable && (
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search users..."
              value={queryParams.search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-4">
            <Select
              value={queryParams.role || "all"}
              onValueChange={handleRoleFilter}
            >
              <SelectTrigger className="w-[140px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roles?.map((role: any) => (
                  <SelectItem key={role.id} value={role.name}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={queryParams.status || "all"}
              onValueChange={handleStatusFilter}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Table */}
      <Card>
        <CardContent className="py-0 px-2">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Created</TableHead>
                  {showActions && (
                    <TableHead className="w-[100px]">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-64">
                      <div className="flex flex-col items-center justify-center">
                        <Users className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No users found</p>
                        <Link href="/dashboard/users/new" className="mt-2">
                          <Button variant="outline" size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Add First User
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.data.map((user: any) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium flex items-center gap-2">
                              {user.username}
                              {user.id === currentUser?.id && (
                                <Badge variant="outline" className="text-xs">
                                  You
                                </Badge>
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role.name)}>
                          <Shield className="mr-1 h-3 w-3" />
                          {user.role.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {user.isActive ? (
                            <Badge variant="secondary" className="gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="gap-1">
                              <XCircle className="h-3 w-3" />
                              Disabled
                            </Badge>
                          )}
                          <Switch
                            checked={user.isActive}
                            onCheckedChange={() =>
                              handleStatusToggle(
                                user.id,
                                user.username,
                                user.isActive
                              )
                            }
                            disabled={
                              updateStatusMutation.isPending ||
                              user.id === currentUser?.id
                            }
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatLastLogin(user.lastLogin)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      {showActions && (
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <Link href={`/dashboard/users/${user.id}/edit`}>
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                              </Link>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() =>
                                  handleDelete(user.id, user.username)
                                }
                                disabled={
                                  deleteUserMutation.isPending ||
                                  user.id === currentUser?.id
                                }
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(data.pagination.page - 1) * data.pagination.limit + 1} to{" "}
            {Math.min(
              data.pagination.page * data.pagination.limit,
              data.pagination.total
            )}{" "}
            of {data.pagination.total} users
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(data.pagination.page - 1)}
              disabled={!data.pagination.hasPrev}
            >
              Previous
            </Button>

            <span className="text-sm">
              Page {data.pagination.page} of {data.pagination.totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(data.pagination.page + 1)}
              disabled={!data.pagination.hasNext}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
