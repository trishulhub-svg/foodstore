import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET /api/categories - List all categories sorted by sortOrder with product count
export async function GET() {
  try {
    const categories = await db.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    })

    // Get product count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const productCount = await db.product.count({
          where: {
            category: category.name,
            isActive: true,
          },
        })
        return {
          ...category,
          productCount,
        }
      })
    )

    return NextResponse.json({
      data: categoriesWithCount,
      total: categoriesWithCount.length,
    })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/categories - Create a category (ADMIN only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = (session.user as any).role
    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { name, icon, color, isActive, sortOrder } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      )
    }

    // Check if category already exists
    const existingCategory = await db.category.findUnique({
      where: { name },
    })
    if (existingCategory) {
      return NextResponse.json(
        { error: "Category with this name already exists" },
        { status: 409 }
      )
    }

    const category = await db.category.create({
      data: {
        name,
        icon: icon || "📦",
        color: color || "#6B7280",
        isActive: isActive !== undefined ? isActive : true,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder, 10) : 0,
      },
    })

    return NextResponse.json(
      { data: { ...category, productCount: 0 } },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
