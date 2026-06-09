import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// PUT /api/categories/[id] - Update a category (ADMIN only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = (session.user as any).role
    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params

    // Check if category exists
    const existingCategory = await db.category.findUnique({ where: { id } })
    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { name, icon, color, isActive, sortOrder } = body

    // Check name uniqueness if changing
    if (name && name !== existingCategory.name) {
      const nameConflict = await db.category.findUnique({ where: { name } })
      if (nameConflict) {
        return NextResponse.json(
          { error: "Category with this name already exists" },
          { status: 409 }
        )
      }
    }

    // Build update data
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (icon !== undefined) updateData.icon = icon
    if (color !== undefined) updateData.color = color
    if (isActive !== undefined) updateData.isActive = isActive
    if (sortOrder !== undefined) updateData.sortOrder = parseInt(sortOrder, 10)

    // Update category
    const category = await db.category.update({
      where: { id },
      data: updateData,
    })

    // If the name changed, update all products with the old category name
    if (name && name !== existingCategory.name) {
      await db.product.updateMany({
        where: { category: existingCategory.name },
        data: { category: name },
      })
    }

    // Get product count
    const productCount = await db.product.count({
      where: { category: category.name, isActive: true },
    })

    return NextResponse.json({
      data: { ...category, productCount },
    })
  } catch (error) {
    console.error("Error updating category:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE /api/categories/[id] - Delete a category (ADMIN only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = (session.user as any).role
    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params

    // Check if category exists
    const existingCategory = await db.category.findUnique({ where: { id } })
    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      )
    }

    // Check if there are active products in this category
    const productCount = await db.product.count({
      where: { category: existingCategory.name, isActive: true },
    })

    if (productCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete category. There are ${productCount} active products in this category.` },
        { status: 400 }
      )
    }

    // Delete the category
    await db.category.delete({ where: { id } })

    return NextResponse.json({
      message: "Category deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
