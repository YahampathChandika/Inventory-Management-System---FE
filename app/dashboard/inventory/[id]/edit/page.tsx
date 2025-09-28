"use client";

import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { InventoryForm } from "@/components/inventory/inventory-form";
import { ProtectedRoute } from "@/components/layout/protected-route";
import {
  useInventoryItem,
  useUpdateInventoryItem,
} from "@/hooks/use-inventory";
import { UpdateInventoryItem } from "@/types";
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react";

export default function EditInventoryPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);

  const { data: item, isLoading, error } = useInventoryItem(id);
  const updateItemMutation = useUpdateInventoryItem();

  const handleSubmit = (data: UpdateInventoryItem) => {
    updateItemMutation.mutate(
      { id, data },
      {
        onSuccess: () => {
          router.push("/dashboard/inventory");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <ProtectedRoute requiredRole="Manager">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/inventory">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Edit Inventory Item</h1>
              <p className="text-muted-foreground">Loading item details...</p>
            </div>
          </div>

          <Card>
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !item) {
    return (
      <ProtectedRoute requiredRole="Manager">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/inventory">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Edit Inventory Item</h1>
              <p className="text-muted-foreground">Item not found</p>
            </div>
          </div>

          <Card>
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center">
                <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  {error instanceof Error ? error.message : "Item not found"}
                </p>
                <Link href="/dashboard/inventory" className="mt-4 inline-block">
                  <Button variant="outline">Back to Inventory</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="Manager">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/inventory">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Edit Inventory Item</h1>
            <p className="text-muted-foreground">
              Update details for &quot;{item.name}&quot;
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-7xl">
          <InventoryForm
            mode="edit"
            initialData={item}
            onSubmit={handleSubmit}
            isLoading={updateItemMutation.isPending}
          />
        </div>

        {/* Item Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-muted-foreground">Created by:</span>
                  <span className="ml-2 font-medium">
                    {item.createdBy.username}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    Last updated by:
                  </span>
                  <span className="ml-2 font-medium">
                    {item.updatedBy.username}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Created:</span>
                  <span className="ml-2">
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Last updated:</span>
                  <span className="ml-2">
                    {new Date(item.updatedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
