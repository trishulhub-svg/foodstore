import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET /api/notifications — Get user's notifications
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as any).id
    const userRole = (session.user as any).role
    const { searchParams } = new URL(request.url)

    const queryUserId = searchParams.get("userId")
    const isRead = searchParams.get("isRead")

    // Use query userId only if admin, otherwise use session userId
    const targetUserId = queryUserId && userRole === "ADMIN" ? queryUserId : userId

    const where: any = { userId: targetUserId }

    if (isRead !== null && isRead !== undefined && isRead !== "") {
      where.isRead = isRead === "true"
    }

    const notifications = await db.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })

    const unreadCount = await db.notification.count({
      where: { userId: targetUserId, isRead: false },
    })

    return NextResponse.json({
      data: notifications,
      unreadCount,
    })
  } catch (error) {
    console.error("Get notifications error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/notifications — Mark as read
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as any).id
    const userRole = (session.user as any).role
    const body = await request.json()
    const { notificationId, all } = body

    if (all === true) {
      // Mark all notifications as read for user
      const targetUserId = body.userId && userRole === "ADMIN" ? body.userId : userId

      const result = await db.notification.updateMany({
        where: { userId: targetUserId, isRead: false },
        data: { isRead: true },
      })

      return NextResponse.json({
        message: "All notifications marked as read",
        updatedCount: result.count,
      })
    }

    if (!notificationId) {
      return NextResponse.json(
        { error: "notificationId or { all: true, userId } is required" },
        { status: 400 }
      )
    }

    // Mark single notification as read
    const notification = await db.notification.findUnique({
      where: { id: notificationId },
    })

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      )
    }

    // Only allow users to mark their own notifications (unless admin)
    if (notification.userId !== userId && userRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const updatedNotification = await db.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    })

    return NextResponse.json({ data: updatedNotification })
  } catch (error) {
    console.error("Mark notification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
