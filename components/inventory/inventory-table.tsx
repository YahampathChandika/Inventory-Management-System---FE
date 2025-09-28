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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useInventory, useDeleteInventoryItem } from "@/hooks/use-inventory";
import { useAuthStore } from "@/lib/store/auth";
import { InventoryQueryParams } from "@/types";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Search,
  Plus,
  Package,
  AlertTriangle,
  Loader2,
  Hash,
} from "lucide-react";
import { QuickQuantityUpdate } from "./quick-quantity-update";

interface InventoryTableProps {
  searchable?: boolean;
  showActions?: boolean;
}

export function InventoryTable({
  searchable = true,
  showActions = true,
}: InventoryTableProps) {
  const [queryParams, setQueryParams] = useState<InventoryQueryParams>({
    page: 1,
    limit: 10,
    search: "",
    sort: "name",
    order: "asc",
  });

  const { hasPermission } = useAuthStore();
  const { data, isLoading, error } = useInventory(queryParams);
  const deleteItemMutation = useDeleteInventoryItem();

  const handleSearch = (search: string) => {
    setQueryParams((prev) => ({
      ...prev,
      search,
      page: 1, // Reset to first page when searching
    }));
  };

  const handleSort = (sort: string) => {
    setQueryParams((prev) => ({
      ...prev,
      sort,
      order: prev.sort === sort && prev.order === "asc" ? "desc" : "asc",
    }));
  };

  const handlePageChange = (page: number) => {
    setQueryParams((prev) => ({ ...prev, page }));
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteItemMutation.mutate(id);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) {
      return { label: "Out of Stock", variant: "destructive" as const };
    } else if (quantity <= 10) {
      return { label: "Low Stock", variant: "outline" as const };
    }
    return { label: "In Stock", variant: "secondary" as const };
  };

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Failed to load inventory
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
          <h2 className="text-2xl font-bold">Inventory Items</h2>
          <p className="text-muted-foreground">
            {data?.pagination.total || 0} items total
          </p>
        </div>

        {hasPermission("Manager") && (
          <Link href="/dashboard/inventory/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </Link>
        )}
      </div>

      {/* Search */}
      {searchable && (
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search inventory..."
              value={queryParams.search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      )}

      {/* Table */}
      <Card>
        <CardContent className="py-0 px-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("name")}
                  >
                    Name
                    {queryParams.sort === "name" && (
                      <span className="ml-1">
                        {queryParams.order === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("quantity")}
                  >
                    Quantity
                    {queryParams.sort === "quantity" && (
                      <span className="ml-1">
                        {queryParams.order === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  {showActions && hasPermission("Manager") && (
                    <TableHead className="w-[50px]"></TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center h-64">
                      <div className="flex flex-col items-center justify-center">
                        <Package className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">
                          No inventory items found
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.data.map((item) => {
                    const stockStatus = getStockStatus(item.quantity);
                    const totalValue = item.unitPrice * item.quantity;

                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          <div>
                            <p className="font-semibold">{item.name}</p>
                            {item.description && (
                              <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-1 py-0.5 rounded">
                            {item.sku || "N/A"}
                          </code>
                        </TableCell>
                        <TableCell>
                          {hasPermission("Manager") ? (
                            <QuickQuantityUpdate item={item}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto p-1 font-mono hover:bg-muted"
                              >
                                <Hash className="h-3 w-3 mr-1" />
                                {item.quantity}
                              </Button>
                            </QuickQuantityUpdate>
                          ) : (
                            <span className="font-mono">{item.quantity}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {item.unitPrice
                            ? formatCurrency(item.unitPrice)
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          {item.unitPrice ? formatCurrency(totalValue) : "N/A"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={stockStatus.variant}>
                            {stockStatus.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(item.updatedAt).toLocaleDateString()}
                        </TableCell>
                        {showActions && hasPermission("Manager") && (
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <Link
                                  href={`/dashboard/inventory/${item.id}/edit`}
                                >
                                  <DropdownMenuItem>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                </Link>
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() =>
                                    handleDelete(item.id, item.name)
                                  }
                                  disabled={deleteItemMutation.isPending}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })
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
            of {data.pagination.total} items
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
