import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

// Role hierarchy: ADMIN > EMPLOYEE > DELIVERY_PARTNER > CUSTOMER
const ROLE_ACCESS: Record<string, string[]> = {
  "/admin": ["ADMIN"],
  "/employee": ["ADMIN", "EMPLOYEE"],
  "/delivery": ["ADMIN", "DELIVERY_PARTNER"],
  "/account": ["ADMIN", "EMPLOYEE", "DELIVERY_PARTNER", "CUSTOMER"],
  "/orders": ["ADMIN", "EMPLOYEE", "DELIVERY_PARTNER", "CUSTOMER"],
  "/cart": ["ADMIN", "EMPLOYEE", "DELIVERY_PARTNER", "CUSTOMER"],
  "/checkout": ["ADMIN", "EMPLOYEE", "DELIVERY_PARTNER", "CUSTOMER"],
}

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  "/",
  "/auth",
  "/api/auth",
  "/api/products",
  "/api/categories",
  "/api/banners",
  "/api/seed",
]

// API route role mappings
const API_ROLE_ACCESS: Record<string, string[]> = {
  "/api/admin": ["ADMIN"],
  "/api/employee": ["ADMIN", "EMPLOYEE"],
  "/api/delivery": ["ADMIN", "DELIVERY_PARTNER"],
  "/api/orders": ["ADMIN", "EMPLOYEE", "DELIVERY_PARTNER", "CUSTOMER"],
  "/api/cart": ["ADMIN", "EMPLOYEE", "DELIVERY_PARTNER", "CUSTOMER"],
  "/api/checkout": ["ADMIN", "EMPLOYEE", "DELIVERY_PARTNER", "CUSTOMER"],
  "/api/addresses": ["ADMIN", "EMPLOYEE", "DELIVERY_PARTNER", "CUSTOMER"],
  "/api/wishlist": ["ADMIN", "EMPLOYEE", "DELIVERY_PARTNER", "CUSTOMER"],
  "/api/reviews": ["ADMIN", "EMPLOYEE", "DELIVERY_PARTNER", "CUSTOMER"],
  "/api/notifications": ["ADMIN", "EMPLOYEE", "DELIVERY_PARTNER", "CUSTOMER"],
  "/api/profile": ["ADMIN", "EMPLOYEE", "DELIVERY_PARTNER", "CUSTOMER"],
}

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  )
}

function getRequiredRoles(pathname: string): string[] | null {
  // Check page routes
  for (const [prefix, roles] of Object.entries(ROLE_ACCESS)) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) {
      return roles
    }
  }

  // Check API routes
  for (const [prefix, roles] of Object.entries(API_ROLE_ACCESS)) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) {
      return roles
    }
  }

  return null
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // Routes that don't match any protected pattern - allow through
  const requiredRoles = getRequiredRoles(pathname)
  if (!requiredRoles) {
    return NextResponse.next()
  }

  // Get JWT token with error handling
  let token
  try {
    token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET || "delivx-demo-secret-2026",
    })
  } catch (error) {
    // Token retrieval failed - treat as unauthenticated
    console.error("Middleware token error:", error)
    token = null
  }

  // Not authenticated - redirect to sign in
  if (!token) {
    // For API routes, return 401
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }
    // For page routes, redirect to sign in
    const signInUrl = new URL("/auth/signin", request.url)
    signInUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(signInUrl)
  }

  // Check role-based access
  if (requiredRoles && token.role) {
    const userRole = token.role as string
    if (!requiredRoles.includes(userRole)) {
      // For API routes, return 403
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Insufficient permissions" },
          { status: 403 }
        )
      }
      // For page routes, redirect to home
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
