import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET /api/admin/users - List all users with filters (ADMIN only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")
    const isActive = searchParams.get("isActive")
    const search = searchParams.get("search")
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "20", 10)

    // Build where clause
    const where: Record<string, unknown> = {}
    if (role) where.role = role
    if (isActive !== null && isActive !== undefined && isActive !== "") {
      where.isActive = isActive === "true"
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ]
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          avatar: true,
          isActive: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.user.count({ where }),
    ])

    return NextResponse.json({
      data: users,
      total,
      page,
      limit,
    })
  } catch (error) {
    console.error("Fetch admin users error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/admin/users - Create user (ADMIN creates EMPLOYEE or DELIVERY_PARTNER accounts)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, email, phone, password, role } = body

    // Validate required fields
    if (!name || !email || !phone || !password || !role) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, phone, password, role" },
        { status: 400 }
      )
    }

    // Validate role - admin can only create EMPLOYEE or DELIVERY_PARTNER
    const allowedRoles = ["EMPLOYEE", "DELIVERY_PARTNER"]
    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { error: "Admin can only create EMPLOYEE or DELIVERY_PARTNER accounts" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    })
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      )
    }

    const user = await db.user.create({
      data: {
        name,
        email,
        phone,
        password, // Plain text for demo
        role,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ data: user }, { status: 201 })
  } catch (error) {
    console.error("Create admin user error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/users - Update user (toggle isActive, change role) (ADMIN only)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { userId, isActive, role } = body

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      )
    }

    // Must provide at least one field to update
    if (isActive === undefined && !role) {
      return NextResponse.json(
        { error: "At least one of isActive or role must be provided" },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id: userId },
    })
    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Prevent admin from deactivating themselves
    if (userId === session.user.id && isActive === false) {
      return NextResponse.json(
        { error: "You cannot deactivate your own account" },
        { status: 400 }
      )
    }

    // Validate role if provided
    if (role) {
      const validRoles = ["ADMIN", "EMPLOYEE", "DELIVERY_PARTNER", "CUSTOMER"]
      if (!validRoles.includes(role)) {
        return NextResponse.json(
          { error: "Invalid role. Must be ADMIN, EMPLOYEE, DELIVERY_PARTNER, or CUSTOMER" },
          { status: 400 }
        )
      }

      // Prevent admin from changing their own role
      if (userId === session.user.id) {
        return NextResponse.json(
          { error: "You cannot change your own role" },
          { status: 400 }
        )
      }
    }

    const updateData: { isActive?: boolean; role?: string } = {}
    if (isActive !== undefined) updateData.isActive = isActive
    if (role) updateData.role = role

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ data: updatedUser })
  } catch (error) {
    console.error("Update admin user error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
