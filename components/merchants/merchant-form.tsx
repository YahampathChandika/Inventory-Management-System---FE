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
import { Switch } from "@/components/ui/switch";
import { Merchant, CreateMerchant } from "@/types";
import { UpdateMerchantRequest } from "@/hooks/use-merchants";
import { Loader2, Store, Mail, User } from "lucide-react";

const merchantSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(255, "Email is too long"),
  isActive: z.boolean().default(true),
});

type MerchantFormData = z.infer<typeof merchantSchema>;

interface MerchantFormProps {
  initialData?: Merchant;
  onSubmit: (data: CreateMerchant | UpdateMerchantRequest) => void;
  isLoading?: boolean;
  mode: "create" | "edit";
}

export function MerchantForm({
  initialData,
  onSubmit,
  isLoading,
  mode,
}: MerchantFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<MerchantFormData>({
    resolver: zodResolver(merchantSchema) as any,
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      isActive: initialData?.isActive ?? true,
    },
  });

  const watchedIsActive = watch("isActive");

  const handleFormSubmit = (data: MerchantFormData) => {
    const submitData: CreateMerchant | UpdateMerchantRequest = {
      name: data.name,
      email: data.email,
      isActive: data.isActive,
    };

    onSubmit(submitData);
  };

  const handleReset = () => {
    if (mode === "create") {
      reset({
        name: "",
        email: "",
        isActive: true,
      });
    } else {
      reset({
        name: initialData?.name || "",
        email: initialData?.email || "",
        isActive: initialData?.isActive ?? true,
      });
    }
  };

  const generateNameFromEmail = (email: string) => {
    if (!email.includes("@")) return "";

    const localPart = email.split("@")[0];
    // Convert common email patterns to readable names
    const cleanName = localPart
      .replace(/[._-]/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase())
      .trim();

    return cleanName;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;

    // Auto-generate name from email if name is empty (only in create mode)
    if (mode === "create" && !watch("name") && email) {
      const suggestedName = generateNameFromEmail(email);
      if (suggestedName) {
        setValue("name", suggestedName);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5" />
          {mode === "create" ? "Add New Merchant" : "Edit Merchant"}
        </CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Add a new merchant contact for inventory reports"
            : "Update merchant contact information"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit as any)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                {...register("email")}
                onChange={(e) => {
                  register("email").onChange(e);
                  handleEmailChange(e);
                }}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                This email will receive inventory reports
              </p>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Contact Name *
              </Label>
              <Input
                id="name"
                placeholder="Enter contact name"
                {...register("name")}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
              {mode === "create" && (
                <p className="text-xs text-muted-foreground">
                  Name will be auto-generated from email if left empty
                </p>
              )}
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Status</Label>
              <p className="text-xs text-muted-foreground">
                {watchedIsActive
                  ? "Active merchants will receive inventory reports"
                  : "Inactive merchants will not receive reports"}
              </p>
            </div>
            <Switch
              checked={watchedIsActive}
              onCheckedChange={(checked) => setValue("isActive", checked)}
              disabled={isLoading}
            />
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
                "Create Merchant"
              ) : (
                "Update Merchant"
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

        {/* Tips */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-medium mb-2">💡 Tips</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Use clear, recognizable names for easy identification</li>
            <li>
              • Double-check email addresses to ensure reports are delivered
            </li>
            <li>• Inactive merchants won't receive any reports</li>
            <li>• You can bulk import multiple merchants from the main page</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
