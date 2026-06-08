import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateOrderNumber } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const userId = searchParams.get('userId')
    const deliveryPartnerId = searchParams.get('deliveryPartnerId')

    const where: any = {}
    if (status) where.status = status
    if (userId) where.userId = userId
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
    const body = await request.json()
    const { addressId, paymentMethod, items, totalAmount, deliveryFee, discount, finalAmount, userId } = body

    if (!addressId || !items || items.length === 0) {
      return NextResponse.json({ error: 'Address and items are required' }, { status: 400 })
    }

    const orderNumber = generateOrderNumber()

    const order = await db.order.create({
      data: {
        orderNumber,
        userId: userId || 'guest',
        addressId,
        status: 'PENDING',
        totalAmount: totalAmount || 0,
        deliveryFee: deliveryFee || 0,
        discount: discount || 0,
        finalAmount: finalAmount || 0,
        paymentMethod: paymentMethod || 'COD',
        paymentStatus: paymentMethod === 'ONLINE' ? 'PENDING' : 'PENDING',
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
      await db.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      })
    }

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
