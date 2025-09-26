// Authentication Types
export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: number;
  name: "Admin" | "Manager" | "Viewer";
  description: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
    expiresIn: string;
  };
}

// Inventory Types
export interface InventoryItem {
  id: number;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  sku: string;
  createdBy: { id: number; username: string };
  updatedBy: { id: number; username: string };
  createdAt: string;
  updatedAt: string;
}

export interface CreateInventoryItem {
  name: string;
  description?: string;
  quantity: number;
  unitPrice?: number;
  sku?: string;
}

export interface UpdateInventoryItem {
  name?: string;
  description?: string;
  quantity?: number;
  unitPrice?: number;
  sku?: string;
}

// Merchant Types
export interface Merchant {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMerchant {
  name: string;
  email: string;
  isActive?: boolean;
}

// Email Types
export interface EmailLog {
  id: number;
  recipientEmail: string;
  subject: string;
  content: string;
  status: "sent" | "failed" | "pending";
  sentBy: { id: number; username: string };
  sentAt: string;
  createdAt: string;
}

export interface SendInventoryReport {
  recipients: string[];
  subject?: string;
  customMessage?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
}

// Query Params
export interface InventoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  role?: string;
  status?: "active" | "inactive";
  search?: string;
}

export interface MerchantQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "active" | "inactive";
}
