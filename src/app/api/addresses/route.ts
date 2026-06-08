import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const addresses = await db.address.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json({ addresses })
  } catch (error) {
    console.error('Fetch addresses error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { label, fullName, phone, addressLine1, addressLine2, city, state, pincode, landmark, isDefault } = body

    if (!fullName || !phone || !addressLine1 || !city || !state || !pincode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // If this is default, unset others
    if (isDefault) {
      await db.address.updateMany({
        where: { userId: session.user.id, isDefault: true },
        data: { isDefault: false },
      })
    }

    const address = await db.address.create({
      data: {
        userId: session.user.id,
        label: label || 'HOME',
        fullName,
        phone,
        addressLine1,
        addressLine2: addressLine2 || null,
        city,
        state,
        pincode,
        landmark: landmark || null,
        isDefault: isDefault || false,
      },
    })

    return NextResponse.json({ address }, { status: 201 })
  } catch (error) {
    console.error('Create address error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
