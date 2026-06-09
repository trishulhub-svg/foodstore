import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET /api/admin/stats - Dashboard stats (ADMIN only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      )
    }

    // Run all count queries in parallel
    const [
      totalUsers,
      totalOrders,
      totalProducts,
      ordersByStatus,
      recentOrders,
      revenueResult,
    ] = await Promise.all([
      db.user.count(),

      db.order.count(),

      db.product.count({ where: { isActive: true } }),

      // Orders grouped by status
      db.order.groupBy({
        by: ["status"],
        _count: { status: true },
      }),

      // Recent 5 orders
      db.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          finalAmount: true,
          createdAt: true,
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),

      // Total revenue from completed orders
      db.order.aggregate({
        _sum: { finalAmount: true },
        where: { paymentStatus: "COMPLETED" },
      }),
    ])

    // Format ordersByStatus into a clean object
    const ordersByStatusMap: Record<string, number> = {}
    for (const item of ordersByStatus) {
      ordersByStatusMap[item.status] = item._count.status
    }

    return NextResponse.json({
      data: {
        totalUsers,
        totalOrders,
        totalRevenue: revenueResult._sum.finalAmount || 0,
        totalProducts,
        ordersByStatus: ordersByStatusMap,
        recentOrders,
      },
    })
  } catch (error) {
    console.error("Fetch admin stats error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
