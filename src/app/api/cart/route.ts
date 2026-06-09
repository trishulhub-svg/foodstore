import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET /api/cart — Get user's cart with product details and totals
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { searchParams } = new URL(request.url)
    const queryUserId = searchParams.get("userId")

    // Use query userId only if admin, otherwise use session userId
    const targetUserId = queryUserId && (session.user as any).role === "ADMIN" ? queryUserId : userId

    const cartItems = await db.cart.findMany({
      where: { userId: targetUserId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            discountPrice: true,
            images: true,
            unit: true,
            stock: true,
            isActive: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const subtotal = cartItems.reduce((sum, item) => {
      const price = item.product.discountPrice ?? item.product.price
      return sum + price * item.quantity
    }, 0)

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

    const totalSavings = cartItems.reduce((sum, item) => {
      if (item.product.discountPrice) {
        return sum + (item.product.price - item.product.discountPrice) * item.quantity
      }
      return sum
    }, 0)

    return NextResponse.json({
      data: cartItems,
      subtotal,
      totalItems,
      totalSavings,
    })
  } catch (error) {
    console.error("Get cart error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/cart — Add item to cart
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { userId, productId, quantity } = body

    if (!userId || !productId || !quantity) {
      return NextResponse.json(
        { error: "userId, productId, and quantity are required" },
        { status: 400 }
      )
    }

    if (quantity < 1) {
      return NextResponse.json(
        { error: "Quantity must be at least 1" },
        { status: 400 }
      )
    }

    // Only allow users to add to their own cart (unless admin)
    const sessionUserId = (session.user as any).id
    const userRole = (session.user as any).role
    if (userId !== sessionUserId && userRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Check product exists and is active
    const product = await db.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    if (!product.isActive) {
      return NextResponse.json({ error: "Product is not available" }, { status: 400 })
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { error: `Insufficient stock. Available: ${product.stock}` },
        { status: 400 }
      )
    }

    // Upsert cart item (create or update quantity)
    const cartItem = await db.cart.upsert({
      where: {
        userId_productId: { userId, productId },
      },
      update: {
        quantity: { increment: quantity },
      },
      create: {
        userId,
        productId,
        quantity,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            discountPrice: true,
            images: true,
            unit: true,
            stock: true,
          },
        },
      },
    })

    return NextResponse.json({ data: cartItem }, { status: 201 })
  } catch (error) {
    console.error("Add to cart error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/cart — Clear entire cart
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const queryUserId = searchParams.get("userId")

    const sessionUserId = (session.user as any).id
    const userRole = (session.user as any).role

    // Use query userId only if admin, otherwise use session userId
    const targetUserId = queryUserId && userRole === "ADMIN" ? queryUserId : sessionUserId

    const result = await db.cart.deleteMany({
      where: { userId: targetUserId },
    })

    return NextResponse.json({
      message: "Cart cleared",
      deletedCount: result.count,
    })
  } catch (error) {
    console.error("Clear cart error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
