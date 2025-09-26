"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useUpdateInventoryQuantity } from "@/hooks/use-inventory";
import { InventoryItem } from "@/types";
import { Package, Loader2 } from "lucide-react";

interface QuickQuantityUpdateProps {
  item: InventoryItem;
  children: React.ReactNode;
}

export function QuickQuantityUpdate({
  item,
  children,
}: QuickQuantityUpdateProps) {
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(item.quantity);
  const updateQuantityMutation = useUpdateInventoryQuantity();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateQuantityMutation.mutate(
      { id: item.id, quantity: Number(quantity) },
      {
        onSuccess: () => {
          setOpen(false);
        },
      }
    );
  };

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (open) {
      setQuantity(item.quantity); // Reset to current quantity when opening
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Update Quantity
          </DialogTitle>
          <DialogDescription>
            Update the quantity for "{item.name}"
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Current quantity:</span>
                <span className="ml-2 font-mono font-medium">
                  {item.quantity}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">SKU:</span>
                <span className="ml-2 font-mono text-xs">
                  {item.sku || "N/A"}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="quantity" className="text-sm font-medium">
                New Quantity
              </label>
              <Input
                id="quantity"
                type="number"
                min="0"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                disabled={updateQuantityMutation.isPending}
                autoFocus
              />
            </div>

            {quantity !== item.quantity && (
              <div className="text-sm text-muted-foreground">
                Change: {quantity > item.quantity ? "+" : ""}
                {quantity - item.quantity}
              </div>
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={updateQuantityMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                updateQuantityMutation.isPending || quantity === item.quantity
              }
            >
              {updateQuantityMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Quantity"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
