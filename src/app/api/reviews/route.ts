import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET /api/reviews?productId=xxx or /api/reviews?userId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")
    const userId = searchParams.get("userId")
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "10", 10)

    if (!productId && !userId) {
      return NextResponse.json(
        { error: "Either productId or userId query parameter is required" },
        { status: 400 }
      )
    }

    const where: Record<string, string> = {}
    if (productId) where.productId = productId
    if (userId) where.userId = userId

    const [reviews, total] = await Promise.all([
      db.review.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, avatar: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.review.count({ where }),
    ])

    return NextResponse.json({
      data: reviews,
      total,
      page,
      limit,
    })
  } catch (error) {
    console.error("Fetch reviews error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/reviews - Create a review
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { productId, orderId, rating, comment } = body

    // Validate required fields
    if (!productId || !orderId || !rating || !comment) {
      return NextResponse.json(
        { error: "Missing required fields: productId, orderId, rating, comment" },
        { status: 400 }
      )
    }

    // Validate rating (1-5)
    const ratingNum = parseInt(String(rating), 10)
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      )
    }

    // Verify the product exists
    const product = await db.product.findUnique({
      where: { id: productId },
    })
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    // Verify the order exists and belongs to the user
    const order = await db.order.findUnique({
      where: { id: orderId },
    })
    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    if (session.user.role !== "ADMIN" && order.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only review your own orders" },
        { status: 403 }
      )
    }

    // Check if user already reviewed this product for this order
    const existingReview = await db.review.findFirst({
      where: {
        userId: session.user.id,
        productId,
        orderId,
      },
    })
    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this product for this order" },
        { status: 409 }
      )
    }

    const review = await db.review.create({
      data: {
        userId: session.user.id,
        productId,
        orderId,
        rating: ratingNum,
        comment,
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    })

    return NextResponse.json({ data: review }, { status: 201 })
  } catch (error) {
    console.error("Create review error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
