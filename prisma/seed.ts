import { PrismaClient, Role, AddressLabel } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clean existing data
  await prisma.review.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.deliveryTracking.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.cart.deleteMany()
  await prisma.wishlist.deleteMany()
  await prisma.address.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.banner.deleteMany()
  await prisma.user.deleteMany()

  console.log('🧹 Cleaned existing data')

  // ============================================
  // CREATE USERS
  // ============================================
  const adminPassword = await hash('admin123', 12)
  const empPassword = await hash('emp123', 12)
  const delPassword = await hash('del123', 12)
  const custPassword = await hash('cust123', 12)

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@delivx.com',
      phone: '9999999999',
      password: adminPassword,
      role: Role.ADMIN,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      isActive: true,
      emailVerified: true,
    },
  })

  const employee = await prisma.user.create({
    data: {
      name: 'Rahul Sharma',
      email: 'employee@delivx.com',
      phone: '9999999998',
      password: empPassword,
      role: Role.EMPLOYEE,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=employee',
      isActive: true,
      emailVerified: true,
    },
  })

  const deliveryPartner = await prisma.user.create({
    data: {
      name: 'Amit Patel',
      email: 'delivery@delivx.com',
      phone: '9999999997',
      password: delPassword,
      role: Role.DELIVERY_PARTNER,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=delivery',
      isActive: true,
      emailVerified: true,
    },
  })

  const customer = await prisma.user.create({
    data: {
      name: 'Priya Gupta',
      email: 'customer@delivx.com',
      phone: '9999999996',
      password: custPassword,
      role: Role.CUSTOMER,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=customer',
      isActive: true,
      emailVerified: true,
    },
  })

  console.log('👤 Created 4 users (Admin, Employee, Delivery Partner, Customer)')

  // ============================================
  // CREATE CATEGORIES
  // ============================================
  const categories = await Promise.all([
    prisma.category.create({
      data: { name: 'Fruits', icon: '🍎', color: '#EF4444', isActive: true, sortOrder: 1 },
    }),
    prisma.category.create({
      data: { name: 'Vegetables', icon: '🥬', color: '#22C55E', isActive: true, sortOrder: 2 },
    }),
    prisma.category.create({
      data: { name: 'Dairy', icon: '🥛', color: '#3B82F6', isActive: true, sortOrder: 3 },
    }),
    prisma.category.create({
      data: { name: 'Snacks', icon: '🍿', color: '#F59E0B', isActive: true, sortOrder: 4 },
    }),
    prisma.category.create({
      data: { name: 'Beverages', icon: '☕', color: '#8B5CF6', isActive: true, sortOrder: 5 },
    }),
    prisma.category.create({
      data: { name: 'Bakery', icon: '🍞', color: '#D97706', isActive: true, sortOrder: 6 },
    }),
    prisma.category.create({
      data: { name: 'Meat', icon: '🍗', color: '#DC2626', isActive: true, sortOrder: 7 },
    }),
    prisma.category.create({
      data: { name: 'Essentials', icon: '🧹', color: '#6366F1', isActive: true, sortOrder: 8 },
    }),
  ])

  console.log('📂 Created 8 categories')

  const [fruits, vegetables, dairy, snacks, beverages, bakery, meat, essentials] = categories

  // ============================================
  // CREATE PRODUCTS (50+)
  // ============================================
  const productsData = [
    // FRUITS (8 products)
    { name: 'Alphonso Mango', description: 'Premium Ratnagiri Alphonso mangoes, naturally ripened and sweet', price: 599, discountPrice: 499, category: fruits.name, stock: 120, unit: 'kg', isFeatured: true },
    { name: 'Banana Robusta', description: 'Fresh Robusta bananas, rich in potassium and energy', price: 49, discountPrice: 39, category: fruits.name, stock: 250, unit: 'dozen', isFeatured: false },
    { name: 'Shimla Apple', description: 'Crispy and juicy Shimla apples, perfect for snacking', price: 189, discountPrice: 159, category: fruits.name, stock: 180, unit: 'kg', isFeatured: true },
    { name: 'Papaya', description: 'Fresh and ripe papaya, great for digestion', price: 59, discountPrice: null, category: fruits.name, stock: 100, unit: 'kg', isFeatured: false },
    { name: 'Watermelon', description: 'Sweet and refreshing watermelon, perfect for summer', price: 35, discountPrice: 29, category: fruits.name, stock: 80, unit: 'kg', isFeatured: false },
    { name: 'Nagpur Orange', description: 'Juicy Nagpur oranges, vitamin C rich', price: 99, discountPrice: 79, category: fruits.name, stock: 150, unit: 'kg', isFeatured: false },
    { name: 'Grapes (Sonaka)', description: 'Sweet green Sonaka grapes, seedless variety', price: 89, discountPrice: 69, category: fruits.name, stock: 90, unit: 'kg', isFeatured: false },
    { name: 'Pomegranate', description: 'Fresh pomegranates with ruby red arils, antioxidant rich', price: 149, discountPrice: 119, category: fruits.name, stock: 75, unit: 'kg', isFeatured: true },

    // VEGETABLES (8 products)
    { name: 'Onion (Nashik)', description: 'Premium Nashik onions, essential for Indian cooking', price: 39, discountPrice: 29, category: vegetables.name, stock: 500, unit: 'kg', isFeatured: true },
    { name: 'Potato (Aloo)', description: 'Fresh potatoes, staple of every Indian kitchen', price: 29, discountPrice: 24, category: vegetables.name, stock: 600, unit: 'kg', isFeatured: false },
    { name: 'Tomato', description: 'Ripe and red tomatoes, perfect for gravies and salads', price: 49, discountPrice: 39, category: vegetables.name, stock: 400, unit: 'kg', isFeatured: false },
    { name: 'Green Capsicum', description: 'Fresh green capsicum, crunchy and flavorful', price: 69, discountPrice: null, category: vegetables.name, stock: 120, unit: 'kg', isFeatured: false },
    { name: 'Cauliflower (Phool Gobi)', description: 'Fresh cauliflower, perfect for aloo gobi and more', price: 39, discountPrice: 29, category: vegetables.name, stock: 200, unit: 'piece', isFeatured: false },
    { name: 'Lady Finger (Bhindi)', description: 'Tender bhindi, great for masala bhindi and sambar', price: 59, discountPrice: 49, category: vegetables.name, stock: 150, unit: 'kg', isFeatured: false },
    { name: 'Brinjal (Baingan)', description: 'Fresh purple brinjal, ideal for baingan bharta', price: 45, discountPrice: null, category: vegetables.name, stock: 130, unit: 'kg', isFeatured: false },
    { name: 'Spinach (Palak)', description: 'Fresh green palak, iron-rich leafy vegetable', price: 35, discountPrice: 25, category: vegetables.name, stock: 180, unit: 'bunch', isFeatured: true },

    // DAIRY (7 products)
    { name: 'Amul Taaza Milk', description: 'Amul Taaza toned milk, fresh and nutritious', price: 27, discountPrice: null, category: dairy.name, stock: 300, unit: '500ml', isFeatured: true },
    { name: 'Amul Butter', description: 'Amul pasteurized butter, rich and creamy', price: 57, discountPrice: 54, category: dairy.name, stock: 200, unit: '100g', isFeatured: false },
    { name: 'Mother Dairy Curd', description: 'Thick and creamy dahi, perfect with meals', price: 45, discountPrice: null, category: dairy.name, stock: 180, unit: '400g', isFeatured: false },
    { name: 'Amul Paneer', description: 'Fresh Amul paneer block, soft and delicious', price: 99, discountPrice: 89, category: dairy.name, stock: 120, unit: '200g', isFeatured: true },
    { name: 'Amul Cheese Slices', description: 'Amul processed cheese slices for sandwiches', price: 129, discountPrice: null, category: dairy.name, stock: 100, unit: '200g', isFeatured: false },
    { name: 'Mother Dairy Lassi', description: 'Sweet lassi, refreshing traditional drink', price: 35, discountPrice: 30, category: dairy.name, stock: 150, unit: '200ml', isFeatured: false },
    { name: 'Nandini Ghee', description: 'Pure Nandini ghee, perfect for cooking and pooja', price: 550, discountPrice: 499, category: dairy.name, stock: 80, unit: '500ml', isFeatured: true },

    // SNACKS (7 products)
    { name: 'Haldiram Aloo Bhujia', description: 'Crispy aloo bhujia, perfect tea-time snack', price: 110, discountPrice: 95, category: snacks.name, stock: 250, unit: '200g', isFeatured: false },
    { name: 'Lay\'s Classic Salted', description: 'Lay\'s classic salted potato chips', price: 20, discountPrice: null, category: snacks.name, stock: 400, unit: '52g', isFeatured: false },
    { name: 'Kurkure Masala Munch', description: 'Crunchy kurkure with spicy masala flavor', price: 20, discountPrice: null, category: snacks.name, stock: 350, unit: '90g', isFeatured: false },
    { name: 'Haldiram Moong Dal', description: 'Crispy fried moong dal namkeen', price: 95, discountPrice: 85, category: snacks.name, stock: 200, unit: '200g', isFeatured: false },
    { name: 'Bikano Bhel Puri', description: 'Ready-to-eat bhel puri mix with chutneys', price: 65, discountPrice: null, category: snacks.name, stock: 180, unit: '150g', isFeatured: false },
    { name: 'Haldiram Soan Papdi', description: 'Flaky and sweet soan papdi, festive special', price: 149, discountPrice: 129, category: snacks.name, stock: 150, unit: '250g', isFeatured: true },
    { name: 'Uncle Chips Spicy Treat', description: 'Classic Uncle Chips with spicy masala', price: 20, discountPrice: null, category: snacks.name, stock: 300, unit: '55g', isFeatured: false },

    // BEVERAGES (7 products)
    { name: 'Tata Tea Gold', description: 'Premium Tata Tea Gold, rich taste and aroma', price: 249, discountPrice: 229, category: beverages.name, stock: 200, unit: '250g', isFeatured: true },
    { name: 'Nescafe Classic', description: 'Nescafe classic instant coffee, rich flavor', price: 225, discountPrice: 199, category: beverages.name, stock: 180, unit: '200g', isFeatured: false },
    { name: 'Paper Boat Aam Panna', description: 'Traditional aam panna drink, refreshing and tangy', price: 30, discountPrice: null, category: beverages.name, stock: 300, unit: '200ml', isFeatured: false },
    { name: 'Real Mango Juice', description: 'Real fruit mango juice, no added preservatives', price: 99, discountPrice: 89, category: beverages.name, stock: 220, unit: '1L', isFeatured: false },
    { name: 'Bisleri Water', description: 'Bisleri purified drinking water', price: 20, discountPrice: null, category: beverages.name, stock: 500, unit: '1L', isFeatured: false },
    { name: 'Coca-Cola', description: 'Classic Coca-Cola, chilled refreshment', price: 40, discountPrice: 35, category: beverages.name, stock: 350, unit: '750ml', isFeatured: false },
    { name: 'Horlicks Classic Malt', description: 'Horlicks malted milk drink, nutritional health drink', price: 285, discountPrice: 255, category: beverages.name, stock: 100, unit: '500g', isFeatured: true },

    // BAKERY (6 products)
    { name: 'Britannia Bread', description: 'Soft and fresh Britannia white bread', price: 40, discountPrice: null, category: bakery.name, stock: 200, unit: '400g', isFeatured: false },
    { name: 'Britannia Bourbon', description: 'Chocolate cream biscuits, all-time favorite', price: 30, discountPrice: null, category: bakery.name, stock: 300, unit: '120g', isFeatured: false },
    { name: 'Parle-G Gold', description: 'Classic Parle-G glucose biscuits, larger and richer', price: 45, discountPrice: 40, category: bakery.name, stock: 350, unit: '100g', isFeatured: true },
    { name: 'Britannia Fruit Cake', description: 'Soft and spongy fruit cake, tea-time treat', price: 50, discountPrice: null, category: bakery.name, stock: 150, unit: '100g', isFeatured: false },
    { name: 'Modern Wheat Bread', description: 'Healthy whole wheat bread by Modern', price: 45, discountPrice: null, category: bakery.name, stock: 180, unit: '400g', isFeatured: false },
    { name: 'Unibic Butter Cookies', description: 'Rich and buttery cookies by Unibic', price: 99, discountPrice: 85, category: bakery.name, stock: 120, unit: '200g', isFeatured: false },

    // MEAT (5 products)
    { name: 'Fresh Chicken Breast', description: 'Boneless chicken breast, fresh and lean', price: 299, discountPrice: 259, category: meat.name, stock: 80, unit: '500g', isFeatured: true },
    { name: 'Mutton Curry Cut', description: 'Fresh mutton curry cut pieces, tender and flavorful', price: 599, discountPrice: 549, category: meat.name, stock: 50, unit: '500g', isFeatured: false },
    { name: 'Farm Eggs (6 pack)', description: 'Fresh farm eggs, protein-rich breakfast essential', price: 60, discountPrice: null, category: meat.name, stock: 300, unit: '6 pcs', isFeatured: true },
    { name: 'Pomfret Fish', description: 'Fresh pomfret fish, ideal for frying and curry', price: 499, discountPrice: 449, category: meat.name, stock: 40, unit: '500g', isFeatured: false },
    { name: 'Prawns (Medium)', description: 'Fresh medium prawns, cleaned and deveined', price: 399, discountPrice: 349, category: meat.name, stock: 60, unit: '500g', isFeatured: false },

    // ESSENTIALS (7 products)
    { name: 'Tata Salt', description: 'Tata iodized salt, essential for every kitchen', price: 24, discountPrice: null, category: essentials.name, stock: 400, unit: '1kg', isFeatured: false },
    { name: 'Fortune Sunflower Oil', description: 'Fortune refined sunflower oil for healthy cooking', price: 149, discountPrice: 135, category: essentials.name, stock: 200, unit: '1L', isFeatured: true },
    { name: 'India Gate Basmati Rice', description: 'Premium India Gate basmati rice, long grain aromatic', price: 199, discountPrice: 179, category: essentials.name, stock: 250, unit: '1kg', isFeatured: true },
    { name: 'Aashirvaad Atta', description: 'Aashirvaad whole wheat atta, soft rotis guaranteed', price: 265, discountPrice: 245, category: essentials.name, stock: 300, unit: '5kg', isFeatured: true },
    { name: 'MDH Garam Masala', description: 'MDH garam masala, aromatic spice blend for Indian cooking', price: 89, discountPrice: 79, category: essentials.name, stock: 200, unit: '100g', isFeatured: false },
    { name: 'Surf Excel Matic', description: 'Surf Excel Matic front load washing powder', price: 235, discountPrice: 199, category: essentials.name, stock: 150, unit: '1kg', isFeatured: false },
    { name: 'Vim Dishwash Bar', description: 'Vim dishwash bar with active neo formula', price: 28, discountPrice: null, category: essentials.name, stock: 350, unit: '200g', isFeatured: false },
  ]

  const products = []
  for (const productData of productsData) {
    const product = await prisma.product.create({
      data: {
        name: productData.name,
        description: productData.description,
        price: productData.price,
        discountPrice: productData.discountPrice,
        category: productData.category,
        images: `https://placehold.co/400x400/f5f5f5/999999?text=${encodeURIComponent(productData.name)}`,
        stock: productData.stock,
        unit: productData.unit,
        isActive: true,
        isFeatured: productData.isFeatured,
        userId: admin.id,
      },
    })
    products.push(product)
  }

  console.log(`📦 Created ${products.length} products`)

  // ============================================
  // CREATE BANNERS
  // ============================================
  const banners = await Promise.all([
    prisma.banner.create({
      data: {
        title: 'Fresh Fruits Festival',
        image: 'https://placehold.co/1200x400/FF6B6B/FFFFFF?text=Fresh+Fruits+Festival+-+Up+to+40%25+Off',
        isActive: true,
        sortOrder: 1,
      },
    }),
    prisma.banner.create({
      data: {
        title: 'Daily Essentials Delivery',
        image: 'https://placehold.co/1200x400/4ECDC4/FFFFFF?text=Daily+Essentials+Delivered+in+30+Minutes',
        isActive: true,
        sortOrder: 2,
      },
    }),
    prisma.banner.create({
      data: {
        title: 'Free Delivery on ₹199+',
        image: 'https://placehold.co/1200x400/FFE66D/333333?text=Free+Delivery+on+Orders+Above+%E2%82%B9199',
        isActive: true,
        sortOrder: 3,
      },
    }),
  ])

  console.log(`🖼️ Created ${banners.length} banners`)

  // ============================================
  // CREATE ADDRESSES FOR CUSTOMER
  // ============================================
  const addresses = await Promise.all([
    prisma.address.create({
      data: {
        userId: customer.id,
        label: AddressLabel.HOME,
        fullName: customer.name,
        phone: customer.phone,
        addressLine1: 'Flat 302, Sri Sai Residency',
        addressLine2: 'Near KPHB Colony',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500085',
        landmark: 'Opposite to KPHB Bus Stand',
        isDefault: true,
        latitude: 17.4947,
        longitude: 78.3996,
      },
    }),
    prisma.address.create({
      data: {
        userId: customer.id,
        label: AddressLabel.OFFICE,
        fullName: customer.name,
        phone: customer.phone,
        addressLine1: 'WeWork, 5th Floor, Cyber Pearl',
        addressLine2: 'HITEC City',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500081',
        landmark: 'Near Cyber Towers',
        isDefault: false,
        latitude: 17.4435,
        longitude: 78.3772,
      },
    }),
  ])

  console.log(`📍 Created ${addresses.length} addresses for customer`)

  console.log('✅ Seeding completed successfully!')
  console.log(`
📊 Summary:
   - 4 Users (Admin, Employee, Delivery Partner, Customer)
   - 8 Categories (Fruits, Vegetables, Dairy, Snacks, Beverages, Bakery, Meat, Essentials)
   - ${products.length} Products across all categories
   - 3 Banners
   - 2 Addresses for customer

🔑 Login Credentials:
   - Admin:     admin@delivx.com / admin123
   - Employee:  employee@delivx.com / emp123
   - Delivery:  delivery@delivx.com / del123
   - Customer:  customer@delivx.com / cust123
  `)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
