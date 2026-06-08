# Task a6 - Customer/Address Expert Work Record

**Agent**: Customer/Address Expert  
**Date**: 2026-06-08  
**Status**: ✅ COMPLETED

## Summary

Created all 7 API route files for address management, user profile, reviews, and admin operations for the DelivX delivery app. All routes follow proper auth patterns, input validation, error handling, and consistent response formats.

## Files Created

### 1. `/src/app/api/addresses/route.ts` - GET + POST
- **GET**: List user's addresses by `userId` query param. Sorted by `isDefault` desc, then `createdAt` desc. Auth check: users can only view own addresses (admins can view any).
- **POST**: Create new address. Validates required fields, 6-digit Indian pincode, valid label (HOME/OFFICE/OTHER). If `isDefault=true`, unsets all other defaults for that user first. Returns 201 on success.

### 2. `/src/app/api/addresses/[id]/route.ts` - PUT + DELETE
- **PUT**: Update address fields. Pincode validation on update. If setting `isDefault=true`, unsets other defaults. Only owner or admin can update.
- **DELETE**: Delete address. Only the owner or admin can delete. Returns 404 if not found.

### 3. `/src/app/api/profile/route.ts` - GET + PUT
- **GET**: Get current user's profile from session. Returns user without password.
- **PUT**: Update profile (name, phone, avatar). **Explicitly blocks** role and email changes for security. Returns 403 if attempted.

### 4. `/src/app/api/reviews/route.ts` - GET + POST
- **GET**: List reviews by `productId` or `userId` (one required). Supports pagination (page, limit). Includes user info (name, avatar) in response.
- **POST**: Create review. Requires `productId`, `orderId`, `rating` (1-5), `comment`. Verifies product and order exist. Users can only review their own orders. Checks for duplicate reviews (same user+product+order). Returns 409 if duplicate.

### 5. `/src/app/api/admin/users/route.ts` - GET + POST + PATCH
- **GET**: List all users with filters (`role`, `isActive`, `search`). Search matches name, email, or phone. Paginated. ADMIN only.
- **POST**: Create user (EMPLOYEE or DELIVERY_PARTNER only). Validates email format, password length (6+), checks for duplicate email. ADMIN only.
- **PATCH**: Update user (`isActive`, `role`). Prevents admin from deactivating or changing their own role. Validates role values. ADMIN only.

### 6. `/src/app/api/admin/stats/route.ts` - GET
- **GET**: Dashboard stats: `totalUsers`, `totalOrders`, `totalRevenue` (from COMPLETED payments), `totalProducts` (active only), `ordersByStatus` (grouped), `recentOrders` (last 5 with user info). All queries run in parallel for performance. ADMIN only.

### 7. `/src/app/api/admin/delivery-partners/route.ts` - GET + POST
- **GET**: List delivery partners (role=DELIVERY_PARTNER). Includes `_count.deliveredOrders` for each partner. Supports search and pagination. ADMIN only.
- **POST**: Create delivery partner account. Validates email format, password length, checks for duplicate email. Sets role to DELIVERY_PARTNER automatically. ADMIN only.

## Key Implementation Details

- **Auth pattern**: All routes use `getServerSession(authOptions)` for authentication
- **Authorization**: Owner checks for addresses/reviews, ADMIN checks for admin routes
- **Pincode validation**: `/^[1-9][0-9]{5}$/` - valid 6-digit Indian pincode (first digit 1-9)
- **isDefault handling**: When setting an address as default, all other addresses for that user are unset first via `updateMany`
- **Profile security**: PUT /api/profile explicitly returns 403 for attempts to change `role` or `email`
- **Admin self-protection**: PATCH /api/admin/users prevents admins from deactivating or changing their own role
- **Review dedup**: POST /api/reviews checks for existing review with same userId+productId+orderId
- **Response format**: List responses use `{ data: [], total, page, limit }`. Single items use `{ data: item }`. Errors use `{ error: string }`
- **Passwords**: Stored as plain text for demo (as per project convention)

## Lint Results
- ✅ All 7 API route files pass ESLint with zero errors/warnings
- No modifications to existing files

## Dependencies
- Uses `db` from `@/lib/db` (Prisma client)
- Uses `getServerSession` from `next-auth` and `authOptions` from `@/lib/auth`
- All models (User, Address, Review, Order, Product) are defined in Prisma schema
