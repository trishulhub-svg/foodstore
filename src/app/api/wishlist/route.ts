import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET /api/wishlist - List user's wishlist with product details
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "10", 10)
    const skip = (page - 1) * limit

    const [wishlistItems, total] = await Promise.all([
      db.wishlist.findMany({
        where: { userId },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              description: true,
              price: true,
              discountPrice: true,
              images: true,
              category: true,
              stock: true,
              unit: true,
              isActive: true,
              isFeatured: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.wishlist.count({ where: { userId } }),
    ])

    // Filter out items where product is inactive
    const activeItems = wishlistItems.filter((item) => item.product.isActive)

    return NextResponse.json({
      data: activeItems,
      total,
      page,
      limit,
    })
  } catch (error) {
    console.error("Error fetching wishlist:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/wishlist - Add to wishlist
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { userId: bodyUserId, productId } = body

    // Use session user ID or body userId (session takes precedence for security)
    const userId = (session.user as any).id || bodyUserId

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      )
    }

    // Check if product exists
    const product = await db.product.findUnique({
      where: { id: productId },
    })
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    if (!product.isActive) {
      return NextResponse.json(
        { error: "Cannot add inactive product to wishlist" },
        { status: 400 }
      )
    }

    // Check if already in wishlist
    const existingItem = await db.wishlist.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    })
    if (existingItem) {
      return NextResponse.json(
        { error: "Product already in wishlist" },
        { status: 409 }
      )
    }

    const wishlistItem = await db.wishlist.create({
      data: { userId, productId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            discountPrice: true,
            images: true,
            category: true,
            stock: true,
          },
        },
      },
    })

    return NextResponse.json(
      { data: wishlistItem },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error adding to wishlist:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
