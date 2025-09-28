import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define route permissions
const ROUTE_PERMISSIONS = {
  // Public routes (no auth required)
  public: ["/login", "/health", "/"],

  // Protected routes with role requirements
  viewer: ["/dashboard"],
  manager: [
    "/dashboard/inventory/new",
    "/dashboard/inventory/[id]/edit",
    "/dashboard/merchants",
    "/dashboard/reports",
  ],
  admin: [
    "/dashboard/users",
    "/dashboard/users/new",
    "/dashboard/users/[id]/edit",
  ],
} as const;

// Helper function to check if route matches patterns
// Fixed: Accept readonly string arrays
function matchesRoute(pathname: string, patterns: readonly string[]): boolean {
  return patterns.some((pattern) => {
    // Convert dynamic routes [id] to regex
    const regex = pattern
      .replace(/\[([^\]]+)\]/g, "[^/]+")
      .replace(/\//g, "\\/");

    return (
      new RegExp(`^${regex}$`).test(pathname) ||
      pathname.startsWith(pattern.replace(/\/\[([^\]]+)\].*/, ""))
    );
  });
}

// Helper function to decode JWT and get user info
function parseTokenPayload(token: string) {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch {
    return null;
  }
}

// Helper function to check if user has required role
function hasPermission(
  userRole: string,
  requiredRole: "viewer" | "manager" | "admin"
): boolean {
  const roleHierarchy = { viewer: 1, manager: 2, admin: 3 };
  const userLevel =
    roleHierarchy[userRole?.toLowerCase() as keyof typeof roleHierarchy] || 0;
  const requiredLevel = roleHierarchy[requiredRole];
  return userLevel >= requiredLevel;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // Check if route is public
  if (matchesRoute(pathname, ROUTE_PERMISSIONS.public)) {
    return NextResponse.next();
  }

  // Get token from localStorage (since you're using localStorage in your auth store)
  // Note: We need to check cookies since middleware runs server-side
  const token = request.cookies.get("auth_token")?.value;

  // No token - redirect to login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Parse token to get user info
  const payload = parseTokenPayload(token);
  if (!payload || !payload.role) {
    // Invalid token - redirect to login
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  const userRole = payload.role.toLowerCase();

  // Check role-based permissions
  if (
    matchesRoute(pathname, ROUTE_PERMISSIONS.admin) &&
    !hasPermission(userRole, "admin")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (
    matchesRoute(pathname, ROUTE_PERMISSIONS.manager) &&
    !hasPermission(userRole, "manager")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)",
  ],
};
