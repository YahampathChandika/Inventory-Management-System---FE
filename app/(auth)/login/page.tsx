"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { useAuthStore } from "@/lib/store/auth";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, Shield } from "lucide-react";

// Login form validation schema
const loginSchema = z.object({
  username: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuthStore();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
    // Prevent form reset on submission errors
    shouldFocusError: false,
    mode: "onSubmit",
  });

  const onSubmit = async (
    data: LoginFormData,
    event?: React.BaseSyntheticEvent
  ) => {
    // Prevent any default behavior
    event?.preventDefault();
    event?.stopPropagation();

    try {
      setIsLoading(true);

      await login(data);

      toast.success("Login successful!");

      // Redirect to intended page or dashboard
      router.push(redirectTo);
    } catch (error: unknown) {
      console.error("Login error:", error);

      // Extract error message from backend response
      let errorMessage = "Login failed. Please try again.";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error && typeof error === "object" && "message" in error) {
        const errorObj = error as { message: string | string[] };
        if (Array.isArray(errorObj.message)) {
          errorMessage = errorObj.message.join(", ");
        } else {
          errorMessage = errorObj.message;
        }
      }

      // Display the error message
      toast.error(errorMessage);

      form.setValue("password", "", {
        shouldValidate: false,
        shouldDirty: false,
      });
      setTimeout(() => form.setFocus("password"), 100);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-2">
            <Shield className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your Inventory Management account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit(onSubmit)(e);
            }}
            className="space-y-4"
          >
            {/* Username/Email Field */}
            <div className="space-y-2">
              <Label htmlFor="username">Username or Email</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username or email"
                disabled={isLoading}
                {...form.register("username")}
                className={
                  form.formState.errors.username ? "border-destructive" : ""
                }
                autoComplete="username"
              />
              {form.formState.errors.username && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.username.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  disabled={isLoading}
                  {...form.register("password")}
                  className={
                    form.formState.errors.password
                      ? "border-destructive pr-10"
                      : "pr-10"
                  }
                  autoComplete="current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {form.formState.errors.password && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Demo Credentials */}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Demo Credentials:
              </p>
              <div className="text-xs space-y-1">
                <div>
                  <strong>Admin:</strong> admin@test.com / admin123
                </div>
                <div>
                  <strong>Manager:</strong> manager@test.com / manager123
                </div>
                <div>
                  <strong>Viewer:</strong> viewer@test.com / viewer123
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
