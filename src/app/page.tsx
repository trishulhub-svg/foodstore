'use client'

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore, type AppView, type Order } from '@/lib/store'
import { AuthProvider, useAuth } from '@/lib/auth-context'

// Components
import Header from '@/components/delivx/Header'
import SignInModal from '@/components/delivx/SignInModal'
import HeroSection from '@/components/delivx/HeroSection'
import CategoryBar from '@/components/delivx/CategoryBar'
import ProductGrid from '@/components/delivx/ProductGrid'
import CartDrawer from '@/components/delivx/CartDrawer'
import AdminDashboard from '@/components/delivx/AdminDashboard'
import DeliveryDashboard from '@/components/delivx/DeliveryDashboard'
import OrderTracking from '@/components/delivx/OrderTracking'
import AddressManager from '@/components/delivx/AddressManager'
import CheckoutFlow from '@/components/delivx/CheckoutFlow'
import BottomNav from '@/components/delivx/BottomNav'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Package, Loader2, User, MapPin, Settings, LogOut,
  ShoppingBag, Phone, Mail, Calendar, Shield, Bike,
} from 'lucide-react'
import { formatINR, cn } from '@/lib/utils'

// Order List for customers
function CustomerOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const { setView } = useStore()

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders')
        if (res.ok) {
          const data = await res.json()
          setOrders(data.orders || [])
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const selectedOrder = orders.find((o) => o.id === selectedOrderId)

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    PREPARING: 'bg-orange-100 text-orange-700',
    OUT_FOR_DELIVERY: 'bg-purple-100 text-purple-700',
    DELIVERED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
      </div>
    )
  }

  if (selectedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <Button
          variant="ghost"
          onClick={() => setSelectedOrderId(null)}
          className="mb-3 sm:mb-4"
        >
          ← Back to Orders
        </Button>
        <OrderTracking order={selectedOrder} />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
      <h2 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 flex items-center gap-2">
        <Package className="w-5 h-5 text-orange-500" />
        My Orders
      </h2>
      {orders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-700">No orders yet</h3>
          <p className="text-sm text-gray-400 mt-1">Place your first order!</p>
          <Button
            onClick={() => setView('home')}
            className="mt-4 bg-orange-500 hover:bg-orange-600 text-white"
          >
            Browse Menu
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {orders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedOrderId(order.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{order.orderNumber}</span>
                        <Badge className={cn('text-[10px]', statusColors[order.status] || 'bg-gray-100')}>
                          {order.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'long', year: 'numeric',
                        })}
                      </p>
                      {order.orderItems && order.orderItems.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {order.orderItems.map((item) => item.productName).join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-orange-600">{formatINR(order.finalAmount)}</p>
                      <Badge variant="outline" className="text-[10px] mt-1">
                        {order.paymentMethod}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

// Account page
function AccountPage() {
  const { setSignInOpen, setView } = useStore()
  const { data: session } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [addresses, setAddresses] = useState<any[]>([])

  useEffect(() => {
    if (session?.user) {
      fetch('/api/orders').then(r => r.json()).then(d => setOrders(d.orders || [])).catch(() => {})
      fetch('/api/addresses').then(r => r.json()).then(d => setAddresses(d.addresses || [])).catch(() => {})
    }
  }, [session])

  if (!session?.user) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="font-semibold text-gray-700">Sign in to view your account</h3>
        <Button
          onClick={() => setSignInOpen(true)}
          className="mt-4 bg-orange-500 hover:bg-orange-600 text-white"
        >
          Sign In
        </Button>
      </div>
    )
  }

  const role = session.user.role
  const roleIcon = role === 'ADMIN' ? Shield : role === 'DELIVERY_PARTNER' ? Bike : role === 'EMPLOYEE' ? Shield : User

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-3 sm:py-4 space-y-3 sm:space-y-4">
      {/* Profile Card */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4 sm:p-6 text-white">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center">
              {React.createElement(roleIcon, { className: 'w-6 h-6 sm:w-8 sm:h-8 text-white' })}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold">{session.user.name}</h2>
              <p className="text-white/80 text-sm">{session.user.email}</p>
              <Badge className="mt-1 bg-white/20 text-white text-xs">
                {role}
              </Badge>
            </div>
          </div>
        </div>
        <CardContent className="p-3 sm:p-4">
          <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-orange-600">{orders.length}</p>
              <p className="text-xs text-gray-500">Orders</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{addresses.length}</p>
              <p className="text-xs text-gray-500">Addresses</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">
                {formatINR(orders.filter((o: Order) => o.paymentStatus === 'COMPLETED').reduce((s: number, o: Order) => s + o.finalAmount, 0)).replace('₹', '')}
              </p>
              <p className="text-xs text-gray-500">Total Spent</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 space-y-1">
          <button
            onClick={() => setView('orders')}
            className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Package className="w-5 h-5 text-orange-500" />
            <span className="text-sm font-medium">My Orders</span>
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('addresses-section')
              el?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <MapPin className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium">Manage Addresses</span>
          </button>
          {(role === 'ADMIN' || role === 'EMPLOYEE') && (
            <button
              onClick={() => setView('admin')}
              className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-medium">Admin Dashboard</span>
            </button>
          )}
          {role === 'DELIVERY_PARTNER' && (
            <button
              onClick={() => setView('delivery')}
              className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Bike className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium">Delivery Dashboard</span>
            </button>
          )}
        </CardContent>
      </Card>

      {/* Addresses */}
      <Card id="addresses-section" className="border-0 shadow-sm">
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-orange-500" />
            My Addresses
          </h3>
          <AddressManager />
        </CardContent>
      </Card>
    </div>
  )
}

// Main App Content
function AppContent() {
  const { currentView, setView } = useStore()
  const { isAuthenticated, role, isLoading } = useAuth()
  const { data: session } = useSession()
  const [seeded, setSeeded] = useState(false)

  // Auto-seed data on first load
  useEffect(() => {
    if (!seeded) {
      fetch('/api/seed')
        .then((r) => r.json())
        .then(() => setSeeded(true))
        .catch(() => setSeeded(true))
    }
  }, [seeded])

  // Sync user from session to store
  useEffect(() => {
    if (session?.user) {
      useStore.getState().setUser({
        id: session.user.id,
        name: session.user.name || 'User',
        email: session.user.email || '',
        role: (session.user.role as any) || 'CUSTOMER',
      })
    }
  }, [session])

  // Auto-redirect based on role
  useEffect(() => {
    if (isAuthenticated && role) {
      if (role === 'ADMIN' || role === 'EMPLOYEE') {
        if (currentView === 'home') setView('admin')
      } else if (role === 'DELIVERY_PARTNER') {
        if (currentView === 'home') setView('delivery')
      }
    }
  }, [isAuthenticated, role])

  const userRole = role || 'CUSTOMER'
  const isCustomer = userRole === 'CUSTOMER'

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 pb-16 sm:pb-4 md:pb-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {currentView === 'home' && (
              <>
                <HeroSection />
                <CategoryBar />
                <ProductGrid />
              </>
            )}
            {currentView === 'admin' && <AdminDashboard />}
            {currentView === 'delivery' && <DeliveryDashboard />}
            {currentView === 'checkout' && <CheckoutFlow />}
            {currentView === 'orders' && <CustomerOrders />}
            {currentView === 'account' && <AccountPage />}
          </motion.div>
        </AnimatePresence>
      </main>

      <CartDrawer />
      <SignInModal />
      <BottomNav />

      {/* TrishulHub Footer */}
      <footer className="bg-gray-900 text-center py-4 pb-16 sm:pb-20 md:pb-4 mt-auto">
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
            <Bike className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-white font-bold text-sm">FoodStore</span>
        </div>
        <p className="text-gray-400 text-xs">
          Built with ❤️ by{' '}
          <a
            href="https://github.com/trishulhub-svg"
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-400 font-bold hover:text-orange-300 transition-colors"
          >
            TrishulHub
          </a>
        </p>
      </footer>
    </div>
  )
}

// Root page component
export default function DelivXPage() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
