import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const order = await db.order.findUnique({
      where: { id },
      include: {
        orderItems: true,
        address: true,
        deliveryPartner: {
          select: { id: true, name: true, phone: true },
        },
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        deliveryTracking: {
          orderBy: { timestamp: 'desc' },
        },
      },
    })
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    return NextResponse.json({ order })
  } catch (error) {
    console.error('Fetch order error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const updateData: any = {}
    if (body.status) updateData.status = body.status
    if (body.deliveryPartnerId !== undefined) updateData.deliveryPartnerId = body.deliveryPartnerId
    if (body.paymentStatus) updateData.paymentStatus = body.paymentStatus
    if (body.cancelReason) {
      updateData.cancelReason = body.cancelReason
      updateData.cancelledAt = new Date()
    }
    if (body.status === 'DELIVERED') {
      updateData.deliveredAt = new Date()
      updateData.paymentStatus = 'COMPLETED'
    }

    const order = await db.order.update({
      where: { id },
      data: updateData,
    })

    // Create delivery tracking entry if status is an out_for_delivery type
    if (body.status && ['OUT_FOR_DELIVERY', 'DELIVERED'].includes(body.status)) {
      const trackingStatus = body.status === 'OUT_FOR_DELIVERY' ? 'ON_THE_WAY' : 'DELIVERED'
      await db.deliveryTracking.create({
        data: {
          orderId: id,
          status: trackingStatus,
          latitude: 19.076,
          longitude: 72.8777,
          note: `Order status updated to ${body.status}`,
        },
      })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Update order error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
