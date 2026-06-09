import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const VALID_TRACKING_STATUSES = ["PICKED_UP", "ON_THE_WAY", "NEAR_LOCATION", "DELIVERED"]

// GET /api/orders/[id]/tracking — Get all tracking entries for an order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const userId = (session.user as any).id
    const userRole = (session.user as any).role

    // Check order exists
    const order = await db.order.findUnique({
      where: { id },
      select: { id: true, userId: true, deliveryPartnerId: true },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Access control
    const isOwner = order.userId === userId
    const isAssignedPartner = order.deliveryPartnerId === userId
    const isAdmin = userRole === "ADMIN"

    if (!isOwner && !isAssignedPartner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const trackingEntries = await db.deliveryTracking.findMany({
      where: { orderId: id },
      orderBy: { timestamp: "desc" },
    })

    return NextResponse.json({ data: trackingEntries })
  } catch (error) {
    console.error("Get tracking error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/orders/[id]/tracking — Add tracking update
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const userId = (session.user as any).id
    const userRole = (session.user as any).role

    // Check order exists
    const order = await db.order.findUnique({
      where: { id },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Only assigned delivery partner or admin can add tracking
    const isAssignedPartner = order.deliveryPartnerId === userId && userRole === "DELIVERY_PARTNER"
    const isAdmin = userRole === "ADMIN"

    if (!isAssignedPartner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Order must be OUT_FOR_DELIVERY to add tracking
    if (order.status !== "OUT_FOR_DELIVERY") {
      return NextResponse.json(
        { error: "Order must be out for delivery to add tracking updates" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { status, latitude, longitude, note } = body

    if (!status || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: "status, latitude, and longitude are required" },
        { status: 400 }
      )
    }

    if (!VALID_TRACKING_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid tracking status. Valid statuses: ${VALID_TRACKING_STATUSES.join(", ")}` },
        { status: 400 }
      )
    }

    const trackingEntry = await db.$transaction(async (tx) => {
      const entry = await tx.deliveryTracking.create({
        data: {
          orderId: id,
          status,
          latitude: parseFloat(String(latitude)),
          longitude: parseFloat(String(longitude)),
          note: note || null,
        },
      })

      // If DELIVERED tracking status, update the order status too
      if (status === "DELIVERED") {
        await tx.order.update({
          where: { id },
          data: {
            status: "DELIVERED",
            deliveredAt: new Date(),
            paymentStatus: order.paymentMethod === "COD" ? "COMPLETED" : order.paymentStatus,
          },
        })
      }

      return entry
    })

    return NextResponse.json({ data: trackingEntry }, { status: 201 })
  } catch (error) {
    console.error("Add tracking error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
