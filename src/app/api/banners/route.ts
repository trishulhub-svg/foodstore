import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET /api/banners - List active banners sorted by sortOrder
export async function GET() {
  try {
    const banners = await db.banner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    })

    return NextResponse.json({
      data: banners,
      total: banners.length,
    })
  } catch (error) {
    console.error("Error fetching banners:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/banners - Create a banner (ADMIN only)
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
    const { title, image, isActive, sortOrder } = body

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { error: "Banner title is required" },
        { status: 400 }
      )
    }

    if (!image) {
      return NextResponse.json(
        { error: "Banner image is required" },
        { status: 400 }
      )
    }

    const banner = await db.banner.create({
      data: {
        title,
        image,
        isActive: isActive !== undefined ? isActive : true,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder, 10) : 0,
      },
    })

    return NextResponse.json(
      { data: banner },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating banner:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
