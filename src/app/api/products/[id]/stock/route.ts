import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// PATCH /api/products/[id]/stock - Update stock quantity (ADMIN + EMPLOYEE only)
// Body: { quantity: number } sets absolute value
// Body: { adjustment: number } increments/decrements current stock
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = (session.user as any).role
    if (userRole !== "ADMIN" && userRole !== "EMPLOYEE") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params

    // Check if product exists
    const existingProduct = await db.product.findUnique({ where: { id } })
    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { quantity, adjustment } = body

    let newStock: number

    if (quantity !== undefined && adjustment !== undefined) {
      return NextResponse.json(
        { error: "Provide either 'quantity' or 'adjustment', not both" },
        { status: 400 }
      )
    }

    if (quantity !== undefined) {
      // Set absolute stock value
      if (typeof quantity !== "number" || quantity < 0) {
        return NextResponse.json(
          { error: "Quantity must be a non-negative number" },
          { status: 400 }
        )
      }
      newStock = quantity
    } else if (adjustment !== undefined) {
      // Increment/decrement stock
      if (typeof adjustment !== "number") {
        return NextResponse.json(
          { error: "Adjustment must be a number" },
          { status: 400 }
        )
      }
      newStock = existingProduct.stock + adjustment
      if (newStock < 0) {
        return NextResponse.json(
          { error: "Stock cannot be negative. Current stock: " + existingProduct.stock },
          { status: 400 }
        )
      }
    } else {
      return NextResponse.json(
        { error: "Provide either 'quantity' (absolute) or 'adjustment' (increment/decrement)" },
        { status: 400 }
      )
    }

    const product = await db.product.update({
      where: { id },
      data: { stock: newStock },
    })

    return NextResponse.json({
      data: product,
      previousStock: existingProduct.stock,
      newStock,
    })
  } catch (error) {
    console.error("Error updating stock:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
