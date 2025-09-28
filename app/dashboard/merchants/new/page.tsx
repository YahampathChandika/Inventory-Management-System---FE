"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MerchantForm } from "@/components/merchants/merchant-form";
import { useCreateMerchant } from "@/hooks/use-merchants";
import { CreateMerchant } from "@/types";
import { UpdateMerchantRequest } from "@/hooks/use-merchants";
import { ArrowLeft } from "lucide-react";

export default function NewMerchantPage() {
  const router = useRouter();
  const createMerchantMutation = useCreateMerchant();

  const handleSubmit = (data: CreateMerchant | UpdateMerchantRequest) => {
    const createData: CreateMerchant = {
      name: data.name!,
      email: data.email!,
      isActive: data.isActive ?? true,
    };

    createMerchantMutation.mutate(createData, {
      onSuccess: () => {
        router.push("/dashboard/merchants");
      },
    });
  };

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
          <h1 className="text-2xl font-bold">Add New Merchant</h1>
          <p className="text-muted-foreground">
            Create a new merchant contact for inventory reports
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-7xl">
        <MerchantForm
          mode="create"
          onSubmit={handleSubmit}
          isLoading={createMerchantMutation.isPending}
        />
      </div>
    </div>
  );
}
