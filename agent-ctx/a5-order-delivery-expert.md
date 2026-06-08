# Task a5 - Order/Delivery Expert Work Record

## Summary
Created all 8 API route files for order, cart, and delivery tracking for the DelivX delivery app.

## Files Created

### 1. `/src/app/api/cart/route.ts` — GET + POST + DELETE
- **GET**: Fetch user's cart with product details, subtotal, totalItems, totalSavings. Admin can query other users' carts.
- **POST**: Add item to cart with upsert (increment quantity if exists). Validates product existence, active status, and stock.
- **DELETE**: Clear entire cart for user. Admin can clear other users' carts.

### 2. `/src/app/api/cart/[productId]/route.ts` — PUT + DELETE
- **PUT**: Update cart item quantity. Validates stock availability.
- **DELETE**: Remove single item from cart. Requires userId query param.

### 3. `/src/app/api/orders/route.ts` — GET + POST
- **GET**: Paginated order listing. ADMIN sees all, DELIVERY_PARTNER sees assigned orders, others see own. Filters by userId and status.
- **POST**: Transactional order creation from cart. Validates address ownership, cart non-empty, stock for each item. Uses `generateOrderNumber()`. Creates Order + OrderItems, decrements stock, clears cart. Returns 201.

### 4. `/src/app/api/orders/[id]/route.ts` — GET + PATCH
- **GET**: Single order with full details (items, address, user, delivery partner, tracking).
- **PATCH**: Status transitions with validation (PENDING→CONFIRMED→PREPARING→OUT_FOR_DELIVERY→DELIVERED / CANCELLED). Only ADMIN can assign deliveryPartnerId. OUT_FOR_DELIVERY auto-creates initial DeliveryTracking. CANCELLED restores stock. Owner can cancel PENDING orders.

### 5. `/src/app/api/orders/[id]/tracking/route.ts` — GET + POST
- **GET**: All tracking entries for an order (desc by timestamp).
- **POST**: Add tracking update. Validates PICKED_UP/ON_THE_WAY/NEAR_LOCATION/DELIVERED statuses. DELIVERED tracking auto-updates order status.

### 6. `/src/app/api/delivery/pending/route.ts` — GET
- Get CONFIRMED/PREPARING/OUT_FOR_DELIVERY orders assigned to a delivery partner. Includes address, items, customer info, latest tracking.

### 7. `/src/app/api/delivery/available/route.ts` — GET
- Get unassigned orders with CONFIRMED or PREPARING status. ADMIN + DELIVERY_PARTNER access only.

### 8. `/src/app/api/notifications/route.ts` — GET + POST
- **GET**: User notifications with optional isRead filter. Returns unreadCount.
- **POST**: Mark as read — single notification by ID or mark all as read for a user.

## Key Implementation Details
- All routes use `getServerSession(authOptions)` for authentication
- Role-based access control enforced: ADMIN, DELIVERY_PARTNER, CUSTOMER
- Order creation is fully transactional (`db.$transaction`)
- Stock validation and decrement handled atomically
- Stock restored on order cancellation
- `generateOrderNumber()` from `@/lib/utils` used for order numbers
- Proper HTTP status codes (200, 201, 400, 401, 403, 404, 500)
- Consistent error response format: `{ error: string }`
- List response format: `{ data: [], total, page, limit }`
- No existing files were modified

## Lint Status
All created files pass ESLint. Pre-existing lint errors in other files are unrelated.
