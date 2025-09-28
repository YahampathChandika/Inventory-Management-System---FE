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
import { BulkImport } from "./bulk-import";
import {
  useMerchants,
  useDeleteMerchant,
  useUpdateMerchant,
} from "@/hooks/use-merchants";
import { MerchantQueryParams } from "@/types";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Search,
  Plus,
  Store,
  AlertTriangle,
  Loader2,
  CheckCircle,
  XCircle,
  Filter,
  Upload,
  Mail,
} from "lucide-react";
import { toast } from "sonner";

interface MerchantsTableProps {
  searchable?: boolean;
  showActions?: boolean;
}

export function MerchantsTable({
  searchable = true,
  showActions = true,
}: MerchantsTableProps) {
  const [queryParams, setQueryParams] = useState<MerchantQueryParams>({
    page: 1,
    limit: 10,
    search: "",
    status: undefined,
  });

  const { data, isLoading, error } = useMerchants(queryParams);
  const deleteMerchantMutation = useDeleteMerchant();
  const updateMerchantMutation = useUpdateMerchant();

  const handleSearch = (search: string) => {
    setQueryParams((prev) => ({
      ...prev,
      search,
      page: 1,
    }));
  };

  const handleStatusFilter = (status: string) => {
    setQueryParams((prev: MerchantQueryParams) => ({
      ...prev,
      status:
        status === "all"
          ? undefined
          : (status as "active" | "inactive" | undefined),
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setQueryParams((prev) => ({ ...prev, page }));
  };

  const handleDelete = async (id: number, name: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete merchant "${name}"? This action cannot be undone.`
      )
    ) {
      deleteMerchantMutation.mutate(id);
    }
  };

  const handleStatusToggle = async (
    id: number,
    name: string,
    currentStatus: boolean
  ) => {
    const newStatus = !currentStatus;
    const action = newStatus ? "activate" : "deactivate";

    if (
      window.confirm(`Are you sure you want to ${action} merchant "${name}"?`)
    ) {
      updateMerchantMutation.mutate({
        id,
        data: { isActive: newStatus },
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Failed to load merchants
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
          <h2 className="text-2xl font-bold">Merchant Contacts</h2>
          <p className="text-muted-foreground">
            {data?.pagination.total || 0} merchants total
          </p>
        </div>

        <div className="flex items-center gap-2">
          <BulkImport>
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Bulk Import
            </Button>
          </BulkImport>

          <Link href="/dashboard/merchants/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Merchant
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      {searchable && (
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search merchants..."
              value={queryParams.search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select
            value={queryParams.status || "all"}
            onValueChange={handleStatusFilter}
          >
            <SelectTrigger className="w-[140px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contact</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Updated</TableHead>
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
                        <Store className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground mb-2">
                          No merchants found
                        </p>
                        <div className="flex items-center gap-2">
                          <Link href="/dashboard/merchants/new">
                            <Button variant="outline" size="sm">
                              <Plus className="mr-2 h-4 w-4" />
                              Add First Merchant
                            </Button>
                          </Link>
                          <BulkImport>
                            <Button variant="outline" size="sm">
                              <Upload className="mr-2 h-4 w-4" />
                              Bulk Import
                            </Button>
                          </BulkImport>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.data.map((merchant) => (
                    <TableRow key={merchant.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {merchant.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{merchant.name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <a
                            href={`mailto:${merchant.email}`}
                            className="text-sm hover:underline"
                          >
                            {merchant.email}
                          </a>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {merchant.isActive ? (
                            <Badge variant="secondary" className="gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="gap-1">
                              <XCircle className="h-3 w-3" />
                              Inactive
                            </Badge>
                          )}
                          <Switch
                            checked={merchant.isActive}
                            onCheckedChange={() =>
                              handleStatusToggle(
                                merchant.id,
                                merchant.name,
                                merchant.isActive
                              )
                            }
                            disabled={updateMerchantMutation.isPending}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(merchant.createdAt)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(merchant.updatedAt)}
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
                              <Link
                                href={`/dashboard/merchants/${merchant.id}/edit`}
                              >
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                              </Link>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() =>
                                  handleDelete(merchant.id, merchant.name)
                                }
                                disabled={deleteMerchantMutation.isPending}
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
            of {data.pagination.total} merchants
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
