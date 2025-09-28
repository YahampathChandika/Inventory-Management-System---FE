"use client";

import { useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Shield, Mail, User, Eye, EyeOff } from "lucide-react";

// Mock data for demonstration
const mockRoles = [
  { id: 1, name: "Admin", description: "Full system access" },
  { id: 2, name: "Manager", description: "Manage inventory and reports" },
  { id: 3, name: "Viewer", description: "View-only access" },
];

const createUserSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username is too long")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and hyphens"
    ),
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(255, "Email is too long"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
      "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and only allowed special characters (@$!%*?&)"
    ),
  roleId: z.coerce.number().min(1, "Please select a role"),
  isActive: z.boolean().default(true),
});

const updateUserSchema = createUserSchema.omit({ password: true }).extend({
  password: z.string().optional(),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;
type UpdateUserFormData = z.infer<typeof updateUserSchema>;

interface User {
  id: number;
  username: string;
  email: string;
  role: { id: number; name: string };
  isActive: boolean;
}

interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  roleId: number;
  isActive: boolean;
}

interface UpdateUserRequest {
  username: string;
  email: string;
  roleId: number;
  isActive: boolean;
}

interface UserFormProps {
  initialData?: User;
  onSubmit: (data: CreateUserRequest | UpdateUserRequest) => void;
  isLoading?: boolean;
  mode: "create" | "edit";
}

export function UserForm({
  initialData,
  onSubmit,
  isLoading = false,
  mode,
}: UserFormProps) {
  const roles = mockRoles; // Replace with actual useRoles() hook
  const rolesLoading = false;

  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);

  const schema = mode === "create" ? createUserSchema : updateUserSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CreateUserFormData | UpdateUserFormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      username: initialData?.username || "",
      email: initialData?.email || "",
      password: "",
      roleId: initialData?.role.id || undefined,
      isActive: initialData?.isActive ?? true,
    },
  });

  const watchedRoleId = watch("roleId");
  const watchedIsActive = watch("isActive");

  const handleFormSubmit = (data: CreateUserFormData | UpdateUserFormData) => {
    if (mode === "create") {
      const createData: CreateUserRequest = {
        username: data.username,
        email: data.email,
        password: (data as CreateUserFormData).password,
        roleId: data.roleId,
        isActive: data.isActive,
      };
      onSubmit(createData);
    } else {
      const updateData: UpdateUserRequest = {
        username: data.username,
        email: data.email,
        roleId: data.roleId,
        isActive: data.isActive,
      };
      onSubmit(updateData);
    }
  };

  const handleReset = () => {
    setShowPassword(false); // Reset password visibility
    if (mode === "create") {
      reset({
        username: "",
        email: "",
        password: "",
        roleId: undefined,
        isActive: true,
      });
    } else {
      reset({
        username: initialData?.username || "",
        email: initialData?.email || "",
        roleId: initialData?.role.id || undefined,
        isActive: initialData?.isActive ?? true,
      });
    }
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case "Admin":
        return "text-red-600 dark:text-red-400";
      case "Manager":
        return "text-blue-600 dark:text-blue-400";
      case "Viewer":
        return "text-green-600 dark:text-green-400";
      default:
        return "text-muted-foreground";
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {mode === "create" ? "Create New User" : "Edit User"}
        </CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Add a new user to the system with role-based permissions"
            : "Update user information and permissions"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Username *
              </Label>
              <Input
                id="username"
                placeholder="Enter username"
                {...register("username")}
                disabled={isLoading}
              />
              {errors.username && (
                <p className="text-sm text-destructive">
                  {errors.username.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                3-50 characters, letters, numbers, underscores, and hyphens only
              </p>
            </div>

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
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password (only for create mode) */}
            {mode === "create" && (
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    {...register("password")}
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-muted"
                    onClick={togglePasswordVisibility}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
                <div className="text-xs text-muted-foreground space-y-1">
                  <p className="font-medium">Password requirements:</p>
                  <ul className="space-y-0.5 ml-2">
                    <li>• At least 8 characters long</li>
                    <li>• Include at least 1 uppercase letter</li>
                    <li>• Include at least 1 lowercase letter</li>
                    <li>• Include at least 1 number</li>
                    <li>• Only allowed special characters: @$!%*?&</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Role */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Role *
              </Label>
              <Select
                value={watchedRoleId?.toString() || ""}
                onValueChange={(value) => setValue("roleId", parseInt(value))}
                disabled={isLoading || rolesLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles?.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      <div className="flex items-center gap-2">
                        <span className={getRoleColor(role.name)}>●</span>
                        <span className="font-medium">{role.name}</span>
                        <span className="text-xs text-muted-foreground">
                          - {role.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.roleId && (
                <p className="text-sm text-destructive">
                  {errors.roleId.message}
                </p>
              )}
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Account Status</Label>
              <p className="text-xs text-muted-foreground">
                {watchedIsActive
                  ? "User can login and access the system"
                  : "User is disabled and cannot login"}
              </p>
            </div>
            <Switch
              checked={watchedIsActive}
              onCheckedChange={(checked) => setValue("isActive", checked)}
              disabled={isLoading}
            />
          </div>

          {/* Role Permissions Info */}
          {watchedRoleId && roles && (
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <h4 className="text-sm font-medium mb-2">Role Permissions</h4>
                <div className="text-xs text-muted-foreground space-y-1">
                  {(() => {
                    const selectedRole = roles.find(
                      (r) => r.id === watchedRoleId
                    );
                    if (!selectedRole) return null;

                    const permissions = {
                      Admin: [
                        "Full system access",
                        "User management",
                        "All inventory operations",
                        "All reports",
                      ],
                      Manager: [
                        "Inventory management",
                        "Merchant management",
                        "Send reports",
                        "View all data",
                      ],
                      Viewer: [
                        "View inventory",
                        "View dashboard",
                        "Read-only access",
                      ],
                    };

                    return permissions[
                      selectedRole.name as keyof typeof permissions
                    ]?.map((permission, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span>{permission}</span>
                      </div>
                    ));
                  })()}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Form Actions */}
          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleSubmit(handleFormSubmit as any)}
              disabled={isLoading || rolesLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === "create" ? "Creating..." : "Updating..."}
                </>
              ) : mode === "create" ? (
                "Create User"
              ) : (
                "Update User"
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isLoading}
            >
              Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
