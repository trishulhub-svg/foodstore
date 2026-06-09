import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { execSync } from 'child_process'

export async function GET() {
  return seedDatabase()
}

export async function POST() {
  return seedDatabase()
}

async function seedDatabase() {
  try {
    // Resolve DB URL — works with DATABASE_URL, POSTGRES_URL, or POSTGRES_PRISMA_URL
    const dbUrl =
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      process.env.POSTGRES_PRISMA_URL

    if (!dbUrl) {
      return NextResponse.json(
        { error: 'No database URL configured', details: 'Set DATABASE_URL or POSTGRES_URL in Vercel environment variables' },
        { status: 500 }
      )
    }

    // Ensure DATABASE_URL is set for Prisma CLI (schema.prisma references it)
    process.env.DATABASE_URL = dbUrl

    // Push schema to database (creates tables if they don't exist)
    let schemaPushed = false
    try {
      const result = execSync('npx prisma db push --accept-data-loss --skip-generate 2>&1', {
        encoding: 'utf-8',
        timeout: 60000,
        env: { ...process.env, DATABASE_URL: dbUrl },
      })
      console.log('[Seed] Schema push result:', result)
      schemaPushed = true
    } catch (pushError: any) {
      const stderr = pushError.stderr || pushError.stdout || String(pushError)
      console.error('[Seed] Schema push failed:', stderr)
      // Try to check if tables exist anyway — push might fail if tables already exist with slight differences
      try {
        await db.user.findFirst()
        console.log('[Seed] Tables appear to exist despite push failure, continuing...')
        schemaPushed = true
      } catch {
        return NextResponse.json(
          {
            error: 'Failed to create database tables',
            details: `prisma db push failed and tables do not exist. Error: ${stderr.slice(0, 500)}. Try redeploying — the postinstall script should create tables during build.`,
            hint: 'Make sure DATABASE_URL is set in Vercel (Settings → Environment Variables) and redeploy.',
          },
          { status: 500 }
        )
      }
    }

    // Create demo users
    const users = await Promise.all([
      db.user.upsert({
        where: { email: 'admin@delivx.com' },
        update: {},
        create: {
          name: 'Admin User',
          email: 'admin@delivx.com',
          phone: '+91 9999999999',
          password: 'admin123',
          role: 'ADMIN',
          isActive: true,
        },
      }),
      db.user.upsert({
        where: { email: 'employee@delivx.com' },
        update: {},
        create: {
          name: 'Emp Sharma',
          email: 'employee@delivx.com',
          phone: '+91 8888888888',
          password: 'emp123',
          role: 'EMPLOYEE',
          isActive: true,
        },
      }),
      db.user.upsert({
        where: { email: 'delivery@delivx.com' },
        update: {},
        create: {
          name: 'Ramu Delivery',
          email: 'delivery@delivx.com',
          phone: '+91 7777777777',
          password: 'del123',
          role: 'DELIVERY_PARTNER',
          isActive: true,
        },
      }),
      db.user.upsert({
        where: { email: 'customer@delivx.com' },
        update: {},
        create: {
          name: 'Priya Customer',
          email: 'customer@delivx.com',
          phone: '+91 6666666666',
          password: 'cust123',
          role: 'CUSTOMER',
          isActive: true,
        },
      }),
    ])

    // Create categories
    const categories = await Promise.all([
      db.category.upsert({ where: { name: 'Pizza' }, update: {}, create: { name: 'Pizza', icon: '🍕', color: '#ef4444', sortOrder: 1 } }),
      db.category.upsert({ where: { name: 'Biryani' }, update: {}, create: { name: 'Biryani', icon: '🍛', color: '#f59e0b', sortOrder: 2 } }),
      db.category.upsert({ where: { name: 'Burger' }, update: {}, create: { name: 'Burger', icon: '🍔', color: '#8b5cf6', sortOrder: 3 } }),
      db.category.upsert({ where: { name: 'Chinese' }, update: {}, create: { name: 'Chinese', icon: '🥡', color: '#dc2626', sortOrder: 4 } }),
      db.category.upsert({ where: { name: 'Dosa' }, update: {}, create: { name: 'Dosa', icon: '🫓', color: '#16a34a', sortOrder: 5 } }),
      db.category.upsert({ where: { name: 'North Indian' }, update: {}, create: { name: 'North Indian', icon: '🍲', color: '#ea580c', sortOrder: 6 } }),
      db.category.upsert({ where: { name: 'Desserts' }, update: {}, create: { name: 'Desserts', icon: '🍰', color: '#ec4899', sortOrder: 7 } }),
      db.category.upsert({ where: { name: 'Drinks' }, update: {}, create: { name: 'Drinks', icon: '🥤', color: '#06b6d4', sortOrder: 8 } }),
      db.category.upsert({ where: { name: 'Grocery' }, update: {}, create: { name: 'Grocery', icon: '🛒', color: '#22c55e', sortOrder: 9 } }),
    ])

    // Create demo products
    const adminUser = users[0]
    const productData = [
      { name: 'Margherita Pizza', description: 'Classic Italian pizza with fresh mozzarella and basil', price: 299, discountPrice: 249, category: 'pizza', stock: 50, unit: 'piece', isFeatured: true },
      { name: 'Farmhouse Pizza', description: 'Loaded with fresh vegetables and cheese', price: 399, discountPrice: 349, category: 'pizza', stock: 35, unit: 'piece', isFeatured: true },
      { name: 'Pepperoni Pizza', description: 'Spicy pepperoni with mozzarella cheese', price: 449, discountPrice: null, category: 'pizza', stock: 25, unit: 'piece', isFeatured: false },
      { name: 'Chicken Biryani', description: 'Aromatic basmati rice with tender chicken pieces', price: 349, discountPrice: 299, category: 'biryani', stock: 40, unit: 'plate', isFeatured: true },
      { name: 'Mutton Biryani', description: 'Slow-cooked mutton in fragrant rice', price: 449, discountPrice: null, category: 'biryani', stock: 20, unit: 'plate', isFeatured: false },
      { name: 'Veg Biryani', description: 'Mixed vegetables in aromatic basmati rice', price: 249, discountPrice: 199, category: 'biryani', stock: 45, unit: 'plate', isFeatured: false },
      { name: 'Classic Burger', description: 'Juicy patty with lettuce, tomato and special sauce', price: 149, discountPrice: 99, category: 'burger', stock: 60, unit: 'piece', isFeatured: true },
      { name: 'Cheese Burger', description: 'Double cheese with crispy patty', price: 199, discountPrice: 169, category: 'burger', stock: 40, unit: 'piece', isFeatured: false },
      { name: 'Veg Burger', description: 'Crispy veggie patty with fresh veggies', price: 129, discountPrice: null, category: 'burger', stock: 55, unit: 'piece', isFeatured: false },
      { name: 'Hakka Noodles', description: 'Stir-fried noodles with vegetables in soy sauce', price: 199, discountPrice: 159, category: 'chinese', stock: 40, unit: 'plate', isFeatured: true },
      { name: 'Manchurian', description: 'Crispy vegetable balls in spicy Manchurian sauce', price: 219, discountPrice: null, category: 'chinese', stock: 35, unit: 'plate', isFeatured: false },
      { name: 'Fried Rice', description: 'Wok-tossed rice with vegetables and spices', price: 189, discountPrice: 149, category: 'chinese', stock: 45, unit: 'plate', isFeatured: false },
      { name: 'Masala Dosa', description: 'Crispy crepe with spiced potato filling', price: 129, discountPrice: 99, category: 'dosa', stock: 50, unit: 'piece', isFeatured: true },
      { name: 'Plain Dosa', description: 'Thin and crispy rice crepe', price: 79, discountPrice: null, category: 'dosa', stock: 60, unit: 'piece', isFeatured: false },
      { name: 'Mysore Masala Dosa', description: 'Spicy red chutney spread dosa with potato filling', price: 149, discountPrice: null, category: 'dosa', stock: 30, unit: 'piece', isFeatured: false },
      { name: 'Butter Chicken', description: 'Creamy tomato-based chicken curry', price: 349, discountPrice: 299, category: 'north-indian', stock: 30, unit: 'bowl', isFeatured: true },
      { name: 'Dal Makhani', description: 'Slow-cooked black lentils in butter and cream', price: 249, discountPrice: null, category: 'north-indian', stock: 35, unit: 'bowl', isFeatured: false },
      { name: 'Paneer Tikka Masala', description: 'Grilled paneer in rich spiced gravy', price: 279, discountPrice: 229, category: 'north-indian', stock: 30, unit: 'bowl', isFeatured: true },
      { name: 'Gulab Jamun', description: 'Soft milk dumplings in sugar syrup', price: 99, discountPrice: null, category: 'desserts', stock: 50, unit: 'plate', isFeatured: false },
      { name: 'Rasmalai', description: 'Soft paneer discs in flavored milk', price: 149, discountPrice: 119, category: 'desserts', stock: 25, unit: 'plate', isFeatured: true },
      { name: 'Mango Lassi', description: 'Refreshing yogurt drink with mango pulp', price: 79, discountPrice: null, category: 'drinks', stock: 60, unit: 'glass', isFeatured: false },
      { name: 'Masala Chai', description: 'Traditional spiced Indian tea', price: 39, discountPrice: null, category: 'drinks', stock: 100, unit: 'cup', isFeatured: false },
      { name: 'Fresh Lime Soda', description: 'Refreshing lime with soda water', price: 59, discountPrice: 49, category: 'drinks', stock: 80, unit: 'glass', isFeatured: false },
      { name: 'Basmati Rice 1kg', description: 'Premium aged basmati rice', price: 199, discountPrice: 169, category: 'grocery', stock: 200, unit: 'kg', isFeatured: false },
      { name: 'Toor Dal 500g', description: 'Premium quality toor dal', price: 99, discountPrice: null, category: 'grocery', stock: 150, unit: '500g', isFeatured: false },
      { name: 'Tandoori Chicken', description: 'Smoky charcoal-grilled chicken with spices', price: 329, discountPrice: 279, category: 'north-indian', stock: 25, unit: 'plate', isFeatured: true },
      { name: 'Chole Bhature', description: 'Spicy chickpeas with fluffy fried bread', price: 159, discountPrice: 129, category: 'north-indian', stock: 40, unit: 'plate', isFeatured: false },
      { name: 'Aloo Paratha', description: 'Stuffed potato flatbread with butter', price: 89, discountPrice: null, category: 'north-indian', stock: 50, unit: 'piece', isFeatured: false },
      { name: 'Paneer Butter Masala', description: 'Rich creamy paneer curry', price: 269, discountPrice: 229, category: 'north-indian', stock: 30, unit: 'bowl', isFeatured: false },
      { name: 'Veg Thali', description: 'Complete meal with dal, sabzi, rice, roti, dessert', price: 199, discountPrice: null, category: 'north-indian', stock: 35, unit: 'thali', isFeatured: true },
      { name: 'Chicken Roll', description: 'Spicy chicken wrapped in paratha', price: 139, discountPrice: 109, category: 'burger', stock: 45, unit: 'piece', isFeatured: false },
      { name: 'Spring Rolls', description: 'Crispy fried rolls with vegetable filling', price: 149, discountPrice: null, category: 'chinese', stock: 40, unit: 'plate', isFeatured: false },
      { name: 'Schezwan Noodles', description: 'Spicy Schezwan sauce stir-fried noodles', price: 209, discountPrice: 179, category: 'chinese', stock: 35, unit: 'plate', isFeatured: false },
      { name: 'Gobi Manchurian', description: 'Crispy cauliflower in tangy sauce', price: 199, discountPrice: null, category: 'chinese', stock: 30, unit: 'plate', isFeatured: false },
      { name: 'Egg Biryani', description: 'Fragrant rice with spiced boiled eggs', price: 199, discountPrice: 159, category: 'biryani', stock: 35, unit: 'plate', isFeatured: false },
      { name: 'Prawn Biryani', description: 'Juicy prawns in aromatic basmati rice', price: 499, discountPrice: null, category: 'biryani', stock: 15, unit: 'plate', isFeatured: true },
      { name: 'BBQ Chicken Pizza', description: 'Smoky BBQ chicken with mozzarella and onions', price: 479, discountPrice: 399, category: 'pizza', stock: 30, unit: 'piece', isFeatured: true },
      { name: 'Veg Supreme Pizza', description: 'Loaded with capsicum, onion, corn, olive', price: 369, discountPrice: 319, category: 'pizza', stock: 35, unit: 'piece', isFeatured: false },
      { name: 'Cheese Dosa', description: 'Crispy dosa with melted cheese filling', price: 139, discountPrice: null, category: 'dosa', stock: 40, unit: 'piece', isFeatured: false },
      { name: 'Paper Dosa', description: 'Ultra thin crispy dosa served with chutneys', price: 89, discountPrice: null, category: 'dosa', stock: 45, unit: 'piece', isFeatured: false },
      { name: 'Set Dosa', description: 'Soft spongy dosa set of 3 with sambar', price: 109, discountPrice: 89, category: 'dosa', stock: 35, unit: 'set', isFeatured: false },
      { name: 'Cold Coffee', description: 'Chilled blended coffee with ice cream', price: 129, discountPrice: null, category: 'drinks', stock: 70, unit: 'glass', isFeatured: false },
      { name: 'Butterscotch Shake', description: 'Creamy butterscotch milkshake', price: 149, discountPrice: 119, category: 'drinks', stock: 50, unit: 'glass', isFeatured: false },
      { name: 'Strawberry Shake', description: 'Fresh strawberry milkshake with cream', price: 159, discountPrice: null, category: 'drinks', stock: 45, unit: 'glass', isFeatured: false },
      { name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with molten center', price: 179, discountPrice: 149, category: 'desserts', stock: 20, unit: 'piece', isFeatured: true },
      { name: 'Ice Cream Sundae', description: 'Three scoops with toppings and whipped cream', price: 149, discountPrice: null, category: 'desserts', stock: 30, unit: 'bowl', isFeatured: false },
      { name: 'Brownie with Ice Cream', description: 'Warm fudgy brownie topped with vanilla ice cream', price: 169, discountPrice: 139, category: 'desserts', stock: 25, unit: 'plate', isFeatured: true },
      { name: 'Atta 5kg', description: 'Aashirvaad whole wheat flour', price: 299, discountPrice: 259, category: 'grocery', stock: 100, unit: '5kg', isFeatured: false },
      { name: 'Mustard Oil 1L', description: 'Pure mustard oil for cooking', price: 189, discountPrice: null, category: 'grocery', stock: 80, unit: 'litre', isFeatured: false },
      { name: 'Sugar 1kg', description: 'Refined white sugar', price: 49, discountPrice: null, category: 'grocery', stock: 200, unit: 'kg', isFeatured: false },
      { name: 'Milk 1L', description: 'Amul Taaza toned milk', price: 65, discountPrice: null, category: 'grocery', stock: 150, unit: 'litre', isFeatured: false },
      { name: 'Eggs (12 pack)', description: 'Farm fresh eggs', price: 89, discountPrice: 79, category: 'grocery', stock: 100, unit: 'dozen', isFeatured: false },
      { name: 'Bread', description: 'Fresh white bread loaf', price: 45, discountPrice: null, category: 'grocery', stock: 80, unit: 'piece', isFeatured: false },
    ]

    // Delete in correct order to respect foreign key constraints
    await db.deliveryTracking.deleteMany({})
    await db.orderItem.deleteMany({})
    await db.review.deleteMany({})
    await db.cart.deleteMany({})
    await db.wishlist.deleteMany({})
    await db.order.deleteMany({})
    await db.product.deleteMany({})

    const products = await Promise.all(
      productData.map((p) =>
        db.product.create({
          data: {
            ...p,
            images: p.category,
            userId: adminUser.id,
          },
        })
      )
    )

    // Create demo address for customer
    const customer = users[3]
    await db.address.upsert({
      where: { id: 'demo-address-1' },
      update: {},
      create: {
        id: 'demo-address-1',
        userId: customer.id,
        label: 'HOME',
        fullName: customer.name,
        phone: customer.phone,
        addressLine1: '42, MG Road, Andheri West',
        addressLine2: 'Shanti Nagar',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400053',
        landmark: 'Near City Mall',
        isDefault: true,
      },
    })

    // Create a sample order
    const address = await db.address.findFirst({ where: { userId: customer.id } })
    if (address) {
      await db.order.upsert({
        where: { orderNumber: 'DLX-DEMO-001' },
        update: {},
        create: {
          orderNumber: 'DLX-DEMO-001',
          userId: customer.id,
          addressId: address.id,
          status: 'CONFIRMED',
          totalAmount: 348,
          deliveryFee: 40,
          discount: 0,
          finalAmount: 388,
          paymentMethod: 'COD',
          paymentStatus: 'PENDING',
          orderItems: {
            create: [
              { productId: products[0].id, productName: 'Margherita Pizza', quantity: 1, price: 249, totalPrice: 249 },
              { productId: products[18].id, productName: 'Gulab Jamun', quantity: 1, price: 99, totalPrice: 99 },
            ],
          },
        },
      })
    }

    // Create banners
    await db.banner.deleteMany({})
    await db.banner.createMany({
      data: [
        { title: 'Free Delivery on orders above ₹500', image: 'delivery', isActive: true, sortOrder: 1 },
        { title: 'Flat ₹100 off on orders above ₹1000', image: 'discount', isActive: true, sortOrder: 2 },
        { title: 'New: Grocery delivery now available!', image: 'grocery', isActive: true, sortOrder: 3 },
      ],
    })

    // Create second address for customer
    await db.address.upsert({
      where: { id: 'demo-address-2' },
      update: {},
      create: {
        id: 'demo-address-2',
        userId: customer.id,
        label: 'OFFICE',
        fullName: customer.name,
        phone: customer.phone,
        addressLine1: '301, Cyber Heights, HITEC City',
        addressLine2: 'Phase 2',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500081',
        landmark: 'Near IKEA',
        isDefault: false,
      },
    })

    return NextResponse.json({
      message: 'Seed data created successfully',
      users: users.length,
      categories: categories.length,
      products: products.length,
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 })
  }
}
