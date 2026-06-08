import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// PUT /api/cart/[productId] — Update quantity
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { productId } = await params
    const body = await request.json()
    const { userId, quantity } = body

    if (!userId || quantity === undefined || quantity === null) {
      return NextResponse.json(
        { error: "userId and quantity are required" },
        { status: 400 }
      )
    }

    if (quantity < 1) {
      return NextResponse.json(
        { error: "Quantity must be at least 1" },
        { status: 400 }
      )
    }

    // Only allow users to update their own cart (unless admin)
    const sessionUserId = (session.user as any).id
    const userRole = (session.user as any).role
    if (userId !== sessionUserId && userRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Check if cart item exists
    const cartItem = await db.cart.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    })

    if (!cartItem) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 })
    }

    // Check stock
    const product = await db.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { error: `Insufficient stock. Available: ${product.stock}` },
        { status: 400 }
      )
    }

    const updatedItem = await db.cart.update({
      where: {
        userId_productId: { userId, productId },
      },
      data: { quantity },
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

    return NextResponse.json({ data: updatedItem })
  } catch (error) {
    console.error("Update cart item error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/cart/[productId] — Remove item from cart
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { productId } = await params
    const { searchParams } = new URL(request.url)
    const queryUserId = searchParams.get("userId")

    if (!queryUserId) {
      return NextResponse.json(
        { error: "userId query parameter is required" },
        { status: 400 }
      )
    }

    // Only allow users to delete their own cart (unless admin)
    const sessionUserId = (session.user as any).id
    const userRole = (session.user as any).role
    if (queryUserId !== sessionUserId && userRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Check if cart item exists
    const cartItem = await db.cart.findUnique({
      where: {
        userId_productId: { userId: queryUserId, productId },
      },
    })

    if (!cartItem) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 })
    }

    await db.cart.delete({
      where: {
        userId_productId: { userId: queryUserId, productId },
      },
    })

    return NextResponse.json({ message: "Item removed from cart" })
  } catch (error) {
    console.error("Delete cart item error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
