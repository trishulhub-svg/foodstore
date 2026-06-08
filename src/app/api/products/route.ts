import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured')

    const where: any = { isActive: true }
    if (category) where.category = category
    if (search) where.name = { contains: search }
    if (featured === 'true') where.isFeatured = true

    const products = await db.product.findMany({
      where,
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Fetch products error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, price, discountPrice, category, images, stock, unit, isFeatured, userId } = body

    if (!name || !price || !category || !stock) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const product = await db.product.create({
      data: {
        name,
        description: description || '',
        price: parseFloat(price),
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        category,
        images: images || category,
        stock: parseInt(stock),
        unit: unit || 'piece',
        isFeatured: isFeatured || false,
        userId: userId || 'system',
      },
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
