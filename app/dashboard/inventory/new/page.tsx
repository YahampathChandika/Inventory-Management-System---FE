"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { InventoryForm } from "@/components/inventory/inventory-form";
import { ProtectedRoute } from "@/components/layout/protected-route";
import { useCreateInventoryItem } from "@/hooks/use-inventory";
import { CreateInventoryItem } from "@/types";
import { ArrowLeft } from "lucide-react";

export default function NewInventoryPage() {
  const router = useRouter();
  const createItemMutation = useCreateInventoryItem();

  const handleSubmit = (data: CreateInventoryItem) => {
    createItemMutation.mutate(data, {
      onSuccess: () => {
        router.push("/dashboard/inventory");
      },
    });
  };

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
            <h1 className="text-2xl font-bold">Add New Inventory Item</h1>
            <p className="text-muted-foreground">
              Create a new item for your inventory
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-7xl">
          <InventoryForm
            mode="create"
            onSubmit={handleSubmit as any}
            isLoading={createItemMutation.isPending}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
