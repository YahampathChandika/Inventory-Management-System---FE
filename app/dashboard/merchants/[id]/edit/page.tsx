"use client";

import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MerchantForm } from "@/components/merchants/merchant-form";
import { useMerchant, useUpdateMerchant } from "@/hooks/use-merchants";
import { UpdateMerchantRequest } from "@/hooks/use-merchants";
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react";

export default function EditMerchantPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);

  const { data: merchant, isLoading, error } = useMerchant(id);
  const updateMerchantMutation = useUpdateMerchant();

  const handleSubmit = (data: UpdateMerchantRequest) => {
    updateMerchantMutation.mutate(
      { id, data },
      {
        onSuccess: () => {
          router.push("/dashboard/merchants");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/merchants">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Edit Merchant</h1>
            <p className="text-muted-foreground">Loading merchant details...</p>
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
    );
  }

  if (error || !merchant) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/merchants">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Edit Merchant</h1>
            <p className="text-muted-foreground">Merchant not found</p>
          </div>
        </div>

        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {error instanceof Error ? error.message : "Merchant not found"}
              </p>
              <Link href="/dashboard/merchants" className="mt-4 inline-block">
                <Button variant="outline">Back to Merchants</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/merchants">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit Merchant</h1>
          <p className="text-muted-foreground">
            Update details for "{merchant.name}"
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-7xll w-full">
        <MerchantForm
          mode="edit"
          initialData={merchant}
          onSubmit={handleSubmit}
          isLoading={updateMerchantMutation.isPending}
        />
      </div>

      {/* Merchant Metadata */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 text-sm">
            <h3 className="font-medium mb-2">Merchant Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-muted-foreground">Merchant ID:</span>
                <span className="ml-2 font-mono">{merchant.id}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Email:</span>
                <span className="ml-2 font-mono">{merchant.email}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Created:</span>
                <span className="ml-2">
                  {new Date(merchant.createdAt).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Last Updated:</span>
                <span className="ml-2">
                  {new Date(merchant.updatedAt).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <span
                  className={`ml-2 font-medium ${
                    merchant.isActive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {merchant.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
