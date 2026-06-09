import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateOrderNumber } from '@/lib/utils'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const userId = searchParams.get('userId')
    const deliveryPartnerId = searchParams.get('deliveryPartnerId')

    const where: any = {}
    if (status) where.status = status
    // If not admin, only show user's own orders
    if (session?.user?.role === 'ADMIN' || session?.user?.role === 'EMPLOYEE') {
      if (userId) where.userId = userId
    } else if (session?.user?.id) {
      where.userId = session.user.id
    }
    if (deliveryPartnerId) where.deliveryPartnerId = deliveryPartnerId

    const orders = await db.order.findMany({
      where,
      include: {
        orderItems: true,
        address: true,
        deliveryPartner: {
          select: { id: true, name: true, phone: true },
        },
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Fetch orders error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { addressId, paymentMethod, items, totalAmount, deliveryFee, discount, finalAmount, userId } = body

    if (!addressId || !items || items.length === 0) {
      return NextResponse.json({ error: 'Address and items are required' }, { status: 400 })
    }

    // Use session user ID, fallback to provided userId
    const orderUserId = session?.user?.id || userId
    if (!orderUserId) {
      return NextResponse.json({ error: 'Please sign in to place an order' }, { status: 401 })
    }

    const orderNumber = generateOrderNumber()

    const order = await db.order.create({
      data: {
        orderNumber,
        userId: orderUserId,
        addressId,
        status: 'PENDING',
        totalAmount: totalAmount || 0,
        deliveryFee: deliveryFee || 0,
        discount: discount || 0,
        finalAmount: finalAmount || 0,
        paymentMethod: paymentMethod || 'COD',
        paymentStatus: 'PENDING',
        orderItems: {
          create: items.map((item: any) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
            totalPrice: item.price * item.quantity,
          })),
        },
      },
      include: {
        orderItems: true,
      },
    })

    // Update product stock
    for (const item of items) {
      try {
        await db.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      } catch (e) {
        console.error('Failed to update stock for product:', item.productId, e)
      }
    }

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
