import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define route permissions with correct route patterns
const ROUTE_PERMISSIONS = {
  // Public routes (no auth required)
  public: ["/login", "/health", "/"],

  // Protected routes requiring authentication (any authenticated user)
  authenticated: ["/dashboard", "/profile"],

  // Manager+ routes (Manager and Admin)
  manager: [
    "/inventory/new",
    "/inventory/[id]/edit",
    "/merchants",
    "/merchants/new",
    "/merchants/[id]/edit",
    "/reports",
    "/email-logs",
  ],

  // Admin-only routes
  admin: ["/users", "/users/new", "/users/[id]/edit"],
} as const;

// Helper function to check if route matches patterns
function matchesRoute(pathname: string, patterns: readonly string[]): boolean {
  return patterns.some((pattern) => {
    // Handle exact matches first
    if (pattern === pathname) return true;

    // Convert dynamic routes [id] to regex
    const regexPattern = pattern
      .replace(/\[([^\]]+)\]/g, "([^/]+)") // Convert [id] to capture group
      .replace(/\//g, "\\/"); // Escape forward slashes

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(pathname);
  });
}

// Helper function to decode JWT and get user info
function parseTokenPayload(token: string) {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));

    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTime) {
      return null; // Token expired
    }

    return decoded;
  } catch (error) {
    console.error("Error parsing token:", error);
    return null;
  }
}

// Helper function to check if user has required role
function hasPermission(
  userRole: string,
  requiredRole: "viewer" | "manager" | "admin"
): boolean {
  const roleHierarchy = {
    viewer: 1,
    manager: 2,
    admin: 3,
  };

  const userLevel =
    roleHierarchy[userRole?.toLowerCase() as keyof typeof roleHierarchy] || 0;
  const requiredLevel = roleHierarchy[requiredRole];

  return userLevel >= requiredLevel;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files, API routes, and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/__nextjs")
  ) {
    return NextResponse.next();
  }

  // Allow public routes
  if (matchesRoute(pathname, ROUTE_PERMISSIONS.public)) {
    return NextResponse.next();
  }

  // Get token from cookies
  const token = request.cookies.get("auth_token")?.value;

  // No token - redirect to login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Parse and validate token
  const payload = parseTokenPayload(token);
  if (!payload || !payload.role) {
    // Invalid or expired token - clear cookie and redirect to login
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("auth_token");
    response.cookies.delete("auth_user");
    return response;
  }

  const userRole = payload.role.toLowerCase();

  // Check admin-only routes
  if (
    matchesRoute(pathname, ROUTE_PERMISSIONS.admin) &&
    !hasPermission(userRole, "admin")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Check manager+ routes
  if (
    matchesRoute(pathname, ROUTE_PERMISSIONS.manager) &&
    !hasPermission(userRole, "manager")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Check if user needs any authentication for other protected routes
  if (
    matchesRoute(pathname, ROUTE_PERMISSIONS.authenticated) ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/inventory") ||
    pathname.startsWith("/merchants") ||
    pathname.startsWith("/users") ||
    pathname.startsWith("/reports") ||
    pathname.startsWith("/profile")
  ) {
    // User is authenticated and has basic access
    return NextResponse.next();
  }

  // Allow access to any other routes (fallback)
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
     * - public files with extensions (images, etc)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)",
  ],
};
