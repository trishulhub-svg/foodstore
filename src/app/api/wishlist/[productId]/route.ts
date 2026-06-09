import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// DELETE /api/wishlist/[productId] - Remove from wishlist
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { productId } = await params

    // Check if the wishlist item exists
    const wishlistItem = await db.wishlist.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    })

    if (!wishlistItem) {
      return NextResponse.json(
        { error: "Item not found in wishlist" },
        { status: 404 }
      )
    }

    await db.wishlist.delete({
      where: {
        userId_productId: { userId, productId },
      },
    })

    return NextResponse.json({
      message: "Item removed from wishlist",
    })
  } catch (error) {
    console.error("Error removing from wishlist:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
