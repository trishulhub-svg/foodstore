import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET /api/delivery/available — Get unassigned orders available for delivery pickup
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = (session.user as any).role

    // ADMIN + DELIVERY_PARTNER access
    if (userRole !== "DELIVERY_PARTNER" && userRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const orders = await db.order.findMany({
      where: {
        deliveryPartnerId: null,
        status: {
          in: ["CONFIRMED", "PREPARING"],
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
      },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json({ data: orders })
  } catch (error) {
    console.error("Get available delivery orders error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
