# Inventory Management System - Frontend

A modern, responsive inventory management system built with Next.js and TypeScript. This frontend application provides a complete interface for managing inventory items, users, merchants, and generating email reports.

## 🚀 Features

### Core Functionality
- **Role-Based Access Control** - Three user types: Admin, Manager, Viewer
- **Inventory Management** - Full CRUD operations for inventory items
- **User Management** - Admin can manage system users and permissions
- **Merchant Management** - Manage merchant contacts for reporting
- **Email Reporting** - Send inventory reports to multiple merchants
- **Real-time Updates** - Live data synchronization with React Query
- **Responsive Design** - Works seamlessly on desktop and mobile

### User Roles & Permissions

| Feature | Viewer | Manager | Admin |
|---------|--------|---------|-------|
| View Inventory | ✅ | ✅ | ✅ |
| Add/Edit Inventory | ❌ | ✅ | ✅ |
| Manage Merchants | ❌ | ✅ | ✅ |
| Send Email Reports | ❌ | ✅ | ✅ |
| Manage Users | ❌ | ❌ | ✅ |
| Disable Users | ❌ | ❌ | ✅ |

## 🛠 Tech Stack

- **Framework**: Next.js 15.5.4 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui + Radix UI
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query
- **Form Handling**: React Hook Form + Zod
- **Authentication**: JWT with HTTP-only cookies
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Themes**: next-themes (Light/Dark mode)

## 📁 Project Structure

```
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Authentication routes
│   │   ├── login/               # Login page
│   │   └── layout.tsx           # Auth layout
│   ├── dashboard/               # Protected dashboard routes
│   │   ├── inventory/           # Inventory management
│   │   ├── users/               # User management (Admin)
│   │   ├── merchants/           # Merchant management (Manager+)
│   │   ├── reports/             # Email reporting (Manager+)
│   │   ├── profile/             # User profile
│   │   ├── page.tsx             # Dashboard home
│   │   └── layout.tsx           # Dashboard layout
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home redirect
├── components/                   # Reusable components
│   ├── ui/                      # shadcn/ui components
│   ├── layout/                  # Layout components
│   ├── dashboard/               # Dashboard-specific components
│   ├── inventory/               # Inventory components
│   ├── users/                   # User management components
│   ├── merchants/               # Merchant components
│   └── reports/                 # Reporting components
├── hooks/                       # Custom React hooks
│   ├── use-auth.ts              # Authentication hook
│   ├── use-inventory.ts         # Inventory API hooks
│   ├── use-users.ts             # User management hooks
│   ├── use-merchants.ts         # Merchant API hooks
│   └── use-dashboard.ts         # Dashboard stats hooks
├── lib/                         # Utility libraries
│   ├── api/                     # API client configuration
│   ├── store/                   # Zustand stores
│   ├── utils.ts                 # Utility functions
│   └── validations.ts           # Form validation schemas
├── types/                       # TypeScript type definitions
│   └── index.ts                 # Global types
├── middleware.ts                # Next.js middleware for route protection
└── next.config.ts               # Next.js configuration
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or yarn package manager
- Backend API running on `http://localhost:3001`

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YahampathChandika/Inventory-Management-System---FE
   cd inventory-management-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure your environment variables:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
   NEXT_PUBLIC_APP_NAME="Inventory Management System"
   NEXT_PUBLIC_APP_VERSION="1.0.0"
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

## 🏗 Build & Deployment

### Development Build
```bash
npm run dev          # Start development server with hot reload
npm run build        # Create production build
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Production Deployment
```bash
# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables

#### Required
- `NEXT_PUBLIC_API_URL` - Backend API base URL

#### Optional
- `NEXT_PUBLIC_APP_NAME` - Application name for branding
- `NEXT_PUBLIC_APP_VERSION` - Version number for display

## 🔐 Authentication & Security

### Authentication Flow
1. User submits login credentials
2. JWT token received and stored in HTTP-only cookies
3. Token automatically included in all API requests
4. Route protection via Next.js middleware
5. Automatic redirect on token expiration

### Security Features
- **HTTP-only cookies** - XSS protection
- **CSRF protection** - SameSite cookie policy
- **Route protection** - Middleware-based access control
- **Role validation** - Server-side permission verification
- **Secure headers** - Security headers in Next.js config

## 📊 State Management

### Zustand Store (Global State)
- **Authentication state** - User, token, login status
- **Permission checking** - Role-based access control

### React Query (Server State)
- **API data caching** - Efficient data synchronization
- **Background updates** - Keep data fresh
- **Optimistic updates** - Better user experience
- **Error handling** - Centralized error management

## 🎨 UI/UX Features

### Design System
- **shadcn/ui components** - Consistent, accessible components
- **Dark/Light themes** - User preference support
- **Responsive design** - Mobile-first approach
- **Loading states** - Skeleton loaders and spinners
- **Toast notifications** - User feedback for actions

### Navigation
- **Collapsible sidebar** - Desktop space optimization
- **Mobile drawer** - Touch-friendly mobile navigation
- **Role-based menus** - Dynamic menu items per user role
- **Breadcrumbs** - Clear navigation context

## 📱 Key Components

### Layout Components
- `Header` - Top navigation with user menu and theme toggle
- `Sidebar` - Role-based navigation menu
- `MobileSidebar` - Mobile-optimized navigation drawer

### Feature Components
- `InventoryTable` - Paginated inventory display with search/sort
- `InventoryForm` - Create/edit inventory items
- `QuickQuantityUpdate` - Fast quantity adjustments
- `UserManagement` - Admin user CRUD operations
- `MerchantManagement` - Merchant contact management
- `EmailReporting` - Bulk email sending interface

### Form Components
- **React Hook Form** - Performance-optimized forms
- **Zod validation** - Type-safe validation schemas
- **Error handling** - Field-specific error messages
- **Loading states** - Submit button loading indicators

## 🔌 API Integration

### Base Configuration
```typescript
Base URL: http://localhost:3001/api/v1
Authentication: Bearer JWT token in Authorization header
Content-Type: application/json
```

### Error Handling
- **401 Unauthorized** - Automatic redirect to login
- **403 Forbidden** - Permission denied messages
- **422 Validation** - Form field error display
- **Network errors** - Retry mechanisms and user feedback

### Data Caching
- **Inventory data** - 2 minutes stale time
- **User data** - 5 minutes stale time
- **Dashboard stats** - 5 minutes stale time
- **Background refetch** - Automatic data updates

## 🧪 Development Guide

### Adding New Features

1. **Create API hook**
   ```typescript
   // hooks/use-new-feature.ts
   export function useNewFeature() {
     return useQuery({
       queryKey: ['feature'],
       queryFn: () => apiClient.get('/feature'),
     });
   }
   ```

2. **Add route protection**
   ```typescript
   // middleware.ts - Add to appropriate permission group
   manager: [
     // existing routes...
     "/dashboard/new-feature",
   ],
   ```

3. **Create component**
   ```typescript
   // components/new-feature.tsx
   export function NewFeature() {
     const { hasPermission } = useAuthStore();
     
     if (!hasPermission("Manager")) {
       return <div>Access denied</div>;
     }
     
     return <div>Feature content</div>;
   }
   ```

### Permission Checking Patterns
```typescript
// In components
const { hasPermission } = useAuthStore();

// Role-based checks
if (hasPermission("Admin")) {
  // Admin-only features
}

if (hasPermission("Manager")) {
  // Manager+ features (includes Admin)
}

// In JSX
{hasPermission("Manager") && (
  <Button>Manager+ Action</Button>
)}
```

### Adding Navigation Items
```typescript
// components/layout/sidebar.tsx
const navigationItems: NavigationItem[] = [
  // existing items...
  {
    label: "New Feature",
    href: "/dashboard/new-feature",
    icon: NewIcon,
    description: "Feature description",
    requiredRole: "Manager", // or "Admin" or "Viewer"
  },
];
```

## 🐛 Debugging

### Development Tools
- **React Query Devtools** - Inspect API cache state
- **Zustand DevTools** - Monitor store state changes
- **Next.js DevTools** - Performance and routing insights

### Common Issues

1. **Authentication loops**
   - Check token expiration
   - Verify API URL configuration
   - Clear browser cookies if needed

2. **Permission errors**
   - Verify user role in database
   - Check middleware route patterns
   - Ensure consistent role naming

3. **API errors**
   - Check network tab for request details
   - Verify backend is running on correct port
   - Check CORS configuration

## 📦 Dependencies

### Core Dependencies
- `next` - React framework
- `react` / `react-dom` - React library
- `typescript` - Type safety
- `tailwindcss` - Styling framework

### UI & Design
- `@radix-ui/*` - Accessible component primitives
- `lucide-react` - Icon library
- `next-themes` - Theme management
- `class-variance-authority` - Component variants
- `clsx` / `tailwind-merge` - Conditional styling

### State & Data
- `@tanstack/react-query` - Server state management
- `zustand` - Global state management
- `react-hook-form` - Form handling
- `@hookform/resolvers` - Form validation
- `zod` - Schema validation

### Utilities
- `js-cookie` - Cookie management
- `date-fns` - Date formatting
- `sonner` - Toast notifications

## 🚀 Performance Optimizations

- **Code splitting** - Automatic route-based splitting
- **Image optimization** - Next.js image component
- **Bundle analysis** - Webpack bundle optimization
- **React Query caching** - Minimized API calls
- **Lazy loading** - Dynamic component imports
- **Tree shaking** - Unused code elimination

## 🤝 Support

For questions about this implementation:
- Check the backend API documentation
- Review the component documentation
- Test with different user roles
- Verify environment configuration

---

*Professional Inventory Management System*
