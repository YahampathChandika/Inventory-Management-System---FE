"use client";

import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserForm } from "@/components/users/user-form";
import { useUser, useUpdateUser } from "@/hooks/use-users";
import { UpdateUserRequest } from "@/hooks/use-users";
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);

  const { data: user, isLoading, error } = useUser(id);
  const updateUserMutation = useUpdateUser();

  const handleSubmit = (data: UpdateUserRequest) => {
    updateUserMutation.mutate(
      { id, data },
      {
        onSuccess: () => {
          router.push("/dashboard/users");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6 w-11/12">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/users">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Edit User</h1>
            <p className="text-muted-foreground">Loading user details...</p>
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

  if (error || !user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/users">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Edit User</h1>
            <p className="text-muted-foreground">User not found</p>
          </div>
        </div>

        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {error instanceof Error ? error.message : "User not found"}
              </p>
              <Link href="/dashboard/users" className="mt-4 inline-block">
                <Button variant="outline">Back to Users</Button>
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
        <Link href="/dashboard/users">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit User</h1>
          <p className="text-muted-foreground">
            Update details for &quot;{user.username}&quot;
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-7xl">
        <UserForm
          mode="edit"
          initialData={user}
          onSubmit={handleSubmit}
          isLoading={updateUserMutation.isPending}
        />
      </div>

      {/* User Metadata */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 text-sm">
            <h3 className="font-medium mb-2">User Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-muted-foreground">User ID:</span>
                <span className="ml-2 font-mono">{user.id}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Current Role:</span>
                <span className="ml-2 font-medium">{user.role.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Account Created:</span>
                <span className="ml-2">
                  {new Date(user.createdAt).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Last Updated:</span>
                <span className="ml-2">
                  {new Date(user.updatedAt).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Last Login:</span>
                <span className="ml-2">
                  {user.lastLogin
                    ? new Date(user.lastLogin).toLocaleString()
                    : "Never"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Account Status:</span>
                <span
                  className={`ml-2 font-medium ${
                    user.isActive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {user.isActive ? "Active" : "Disabled"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
