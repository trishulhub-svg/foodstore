import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET /api/delivery/pending — Get pending orders assigned to delivery partner
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = (session.user as any).role
    const userId = (session.user as any).id

    if (userRole !== "DELIVERY_PARTNER" && userRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const deliveryPartnerId = searchParams.get("deliveryPartnerId")

    if (!deliveryPartnerId) {
      return NextResponse.json(
        { error: "deliveryPartnerId query parameter is required" },
        { status: 400 }
      )
    }

    // Delivery partners can only see their own orders
    if (userRole === "DELIVERY_PARTNER" && deliveryPartnerId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const orders = await db.order.findMany({
      where: {
        deliveryPartnerId,
        status: {
          in: ["CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY"],
        },
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                unit: true,
              },
            },
          },
        },
        address: true,
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        deliveryTracking: {
          orderBy: { timestamp: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ data: orders })
  } catch (error) {
    console.error("Get pending delivery orders error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
