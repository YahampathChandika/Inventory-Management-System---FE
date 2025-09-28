import Cookies from "js-cookie";
import { ApiResponse, PaginatedResponse } from "@/types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
const TOKEN_COOKIE_NAME = "auth_token";

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    // Get token from cookies
    const token = Cookies.get(TOKEN_COOKIE_NAME);

    // Default headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    // Add auth header if token exists
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Make request
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include", // Include cookies in requests
    });

    // Handle non-JSON responses (like for health check)
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return {} as T;
    }

    const data = await response.json();

    // Handle HTTP errors
    if (!response.ok) {
      // Handle 401 (Unauthorized) - token expired or invalid
      if (response.status === 401) {
        // Clear cookies and redirect to login
        Cookies.remove(TOKEN_COOKIE_NAME, { path: "/" });
        Cookies.remove("auth_user", { path: "/" });

        // Only redirect if we're in the browser
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }

      // Create error object with API error details
      const error = new Error(
        data.error?.message || `HTTP error! status: ${response.status}`
      );
      (error as any).status = response.status;
      (error as any).code = data.error?.code;
      (error as any).details = data.error?.details;

      throw error;
    }

    // For successful responses, return the data
    if (data.success !== undefined) {
      // Standard API response format
      return data as T;
    }

    // Fallback for non-standard responses
    return data as T;
  }

  // GET request
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: "GET",
      ...options,
    });
  }

  // POST request
  async post<T>(
    endpoint: string,
    body?: any,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  }

  // PUT request
  async put<T>(
    endpoint: string,
    body?: any,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  }

  // PATCH request
  async patch<T>(
    endpoint: string,
    body?: any,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: "DELETE",
      ...options,
    });
  }

  // Helper method to get current token
  getToken(): string | null {
    return Cookies.get(TOKEN_COOKIE_NAME) || null;
  }

  // Helper method to check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

// Create singleton instance
export const apiClient = new ApiClient(BASE_URL);

// Export types for convenience
export type { ApiResponse, PaginatedResponse };
