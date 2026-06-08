# Task a4 - Product/Inventory Expert API Routes

## Summary

Created all 8 product and category API route files for the DelivX delivery app.

## Files Created

### 1. `/src/app/api/products/route.ts` — GET + POST
- **GET**: List products with query params: `category`, `search`, `isFeatured`, `isActive`, `page`, `limit`, `sortBy` (createdAt/price/name/stock), `sortOrder` (asc/desc). Includes category info mapping and user relation. Defaults to active-only products.
- **POST**: Create product (ADMIN + EMPLOYEE only). Validates required fields (name, price, category, stock), price/discount rules, and auto-sets userId from session.

### 2. `/src/app/api/products/[id]/route.ts` — GET + PUT + DELETE
- **GET**: Single product by ID with user info, reviews (with user details), and category info.
- **PUT**: Update product (ADMIN + EMPLOYEE only). Supports partial updates with validation.
- **DELETE**: Soft delete — sets `isActive=false` (ADMIN only).

### 3. `/src/app/api/products/[id]/stock/route.ts` — PATCH
- **PATCH**: Update stock (ADMIN + EMPLOYEE only). Supports two modes:
  - `{ quantity: number }` — sets absolute stock value
  - `{ adjustment: number }` — increments/decrements from current stock
- Prevents negative stock with clear error messages.

### 4. `/src/app/api/categories/route.ts` — GET + POST
- **GET**: Lists active categories sorted by `sortOrder` ascending, each with `productCount`.
- **POST**: Create category (ADMIN only). Validates uniqueness of category name.

### 5. `/src/app/api/categories/[id]/route.ts` — PUT + DELETE
- **PUT**: Update category (ADMIN only). If name changes, updates all associated products' category field.
- **DELETE**: Delete category (ADMIN only). Blocks deletion if active products exist in the category.

### 6. `/src/app/api/banners/route.ts` — GET + POST
- **GET**: Lists active banners sorted by `sortOrder` ascending.
- **POST**: Create banner (ADMIN only). Validates required title and image.

### 7. `/src/app/api/wishlist/route.ts` — GET + POST
- **GET**: List user's wishlist with product details (requires auth). Paginated.
- **POST**: Add to wishlist (requires auth). Validates product exists and is active. Prevents duplicates.

### 8. `/src/app/api/wishlist/[productId]/route.ts` — DELETE
- **DELETE**: Remove from wishlist (requires auth). Uses userId from session + productId from URL.

## Design Decisions

- **Category mapping**: Since `Product.category` is a String (not a Prisma relation), category info is fetched separately and mapped by name, attached as `categoryInfo` in responses.
- **Auth pattern**: Uses `getServerSession(authOptions)` with role checking via `(session.user as any).role`.
- **HTTP status codes**: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 409 (Conflict), 500 (Internal Server Error).
- **Error format**: All errors return `{ error: string }`.
- **List format**: All list endpoints return `{ data: [], total, page, limit }`.
- **Soft delete**: Products are soft-deleted (isActive=false) rather than removed from DB.
- **Stock safety**: Stock adjustment validates against negative values and returns previousStock + newStock.

## Testing Results

- All endpoints tested via curl and return correct responses
- Categories endpoint returns 8 categories with product counts
- Products listing with filtering (category, search, isFeatured) works
- Single product GET returns full details with reviews and category info
- Auth-protected endpoints correctly return 401 for unauthenticated requests
- Non-existent resources return 404
- No new lint errors introduced
