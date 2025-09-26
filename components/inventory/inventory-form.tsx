"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CreateInventoryItem,
  InventoryItem,
  UpdateInventoryItem,
} from "@/types";
import { Loader2 } from "lucide-react";

const inventorySchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  description: z
    .string()
    .max(1000, "Description is too long")
    .optional()
    .or(z.literal("")),
  quantity: z.coerce
    .number()
    .min(0, "Quantity cannot be negative")
    .int("Quantity must be a whole number"),
  unitPrice: z.coerce
    .number()
    .min(0, "Unit price cannot be negative")
    .optional()
    .or(z.literal("")),
  sku: z.string().max(100, "SKU is too long").optional().or(z.literal("")),
});

type InventoryFormData = z.infer<typeof inventorySchema>;

interface InventoryFormProps {
  initialData?: InventoryItem;
  onSubmit: (data: CreateInventoryItem | UpdateInventoryItem) => void;
  isLoading?: boolean;
  mode: "create" | "edit";
}

export function InventoryForm({
  initialData,
  onSubmit,
  isLoading,
  mode,
}: InventoryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<InventoryFormData>({
    resolver: zodResolver(inventorySchema) as any,
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      quantity: initialData?.quantity || 0,
      unitPrice: initialData?.unitPrice || 0,
      sku: initialData?.sku || "",
    },
  });

  const handleFormSubmit = (data: InventoryFormData) => {
    const submitData: CreateInventoryItem | UpdateInventoryItem = {
      name: data.name,
      description: data.description || undefined,
      quantity: data.quantity,
      unitPrice: data.unitPrice || undefined,
      sku: data.sku || undefined,
    };

    onSubmit(submitData);
  };

  const handleReset = () => {
    if (mode === "create") {
      reset({
        name: "",
        description: "",
        quantity: 0,
        unitPrice: 0,
        sku: "",
      });
    } else {
      reset({
        name: initialData?.name || "",
        description: initialData?.description || "",
        quantity: initialData?.quantity || 0,
        unitPrice: initialData?.unitPrice || 0,
        sku: initialData?.sku || "",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Add New Inventory Item" : "Edit Inventory Item"}
        </CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Enter the details for the new inventory item"
            : "Update the inventory item details"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(handleFormSubmit as any)}
          className="space-y-6"
        >
          <div className="grid gap-6 md:grid-cols-2">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                placeholder="Enter item name"
                {...register("name")}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* SKU */}
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                placeholder="Enter SKU (optional)"
                {...register("sku")}
                disabled={isLoading}
              />
              {errors.sku && (
                <p className="text-sm text-destructive">{errors.sku.message}</p>
              )}
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                step="1"
                placeholder="0"
                {...register("quantity")}
                disabled={isLoading}
              />
              {errors.quantity && (
                <p className="text-sm text-destructive">
                  {errors.quantity.message}
                </p>
              )}
            </div>

            {/* Unit Price */}
            <div className="space-y-2">
              <Label htmlFor="unitPrice">Unit Price</Label>
              <Input
                id="unitPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                {...register("unitPrice")}
                disabled={isLoading}
              />
              {errors.unitPrice && (
                <p className="text-sm text-destructive">
                  {errors.unitPrice.message}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm resize-vertical min-h-[80px] disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Enter item description (optional)"
              rows={3}
              {...register("description")}
              disabled={isLoading}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === "create" ? "Creating..." : "Updating..."}
                </>
              ) : mode === "create" ? (
                "Create Item"
              ) : (
                "Update Item"
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={isLoading}
            >
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
