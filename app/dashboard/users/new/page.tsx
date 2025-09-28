"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserForm } from "@/components/users/user-form";
import { useCreateUser } from "@/hooks/use-users";
import { CreateUserRequest, UpdateUserRequest } from "@/hooks/use-users";
import { ArrowLeft } from "lucide-react";

export default function NewUserPage() {
  const router = useRouter();
  const createUserMutation = useCreateUser();

  const handleSubmit = (data: CreateUserRequest | UpdateUserRequest) => {
    // Since this is create mode, we can safely cast to CreateUserRequest
    // The form will provide all required fields for creation
    const createData: CreateUserRequest = {
      username: data.username!,
      email: data.email!,
      password: (data as CreateUserRequest).password,
      roleId: data.roleId!,
      isActive: data.isActive ?? true,
    };

    createUserMutation.mutate(createData, {
      onSuccess: () => {
        router.push("/dashboard/users");
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/users">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Create New User</h1>
          <p className="text-muted-foreground">
            Add a new user to the system with appropriate permissions
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-7xl">
        <UserForm
          mode="create"
          onSubmit={handleSubmit}
          isLoading={createUserMutation.isPending}
        />
      </div>
    </div>
  );
}
