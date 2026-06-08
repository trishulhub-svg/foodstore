'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3, Package, Users, Truck, Plus, Search, Edit, Trash2,
  TrendingUp, DollarSign, ShoppingBag, UserPlus, X, Loader2, Eye,
  ArrowUpDown, RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useStore, type Product, type Order, type User as UserType } from '@/lib/store'
import { formatINR, cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

// Count-up animation hook
function useCountUp(end: number, duration = 1000) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const increment = end / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [end, duration])
  return count
}

function StatCard({ title, value, icon: Icon, color, prefix = '', suffix = '' }: {
  title: string; value: number; icon: React.ElementType; color: string; prefix?: string; suffix?: string
}) {
  const count = useCountUp(value)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">{title}</p>
              <p className="text-2xl font-bold mt-1">
                {prefix}{typeof value === 'number' && prefix === '₹' ? formatINR(count).replace('₹', '') : count}{suffix}
              </p>
            </div>
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', color)}>
              <Icon className="w-5 h-5 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Add Product Modal
function AddProductModal({ onAdded }: { onAdded: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const [form, setForm] = useState({
    name: '', description: '', price: '', discountPrice: '', category: 'pizza',
    stock: '', unit: 'piece', isFeatured: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : null,
          stock: parseInt(form.stock),
          images: form.category,
        }),
      })
      if (res.ok) {
        toast({ title: 'Product added successfully!' })
        setOpen(false)
        setForm({ name: '', description: '', price: '', discountPrice: '', category: 'pizza', stock: '', unit: 'piece', isFeatured: false })
        onAdded()
      } else {
        const data = await res.json()
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error adding product', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white">
          <Plus className="w-4 h-4 mr-1" /> Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Butter Chicken" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required placeholder="Rich, creamy tomato-based curry..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Price (₹)</Label>
              <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required placeholder="299" />
            </div>
            <div className="space-y-2">
              <Label>Discount Price (₹)</Label>
              <Input type="number" value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })} placeholder="249" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['pizza', 'biryani', 'burger', 'chinese', 'dosa', 'north-indian', 'desserts', 'drinks', 'grocery'].map((c) => (
                    <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Stock</Label>
              <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required placeholder="50" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Unit</Label>
              <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="piece / kg / plate" />
            </div>
            <div className="flex items-end gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-sm">Featured</span>
              </label>
            </div>
          </div>
          <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Add Product
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function AdminDashboard() {
  const { currentUser } = useStore()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('overview')
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [users, setUsers] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)
  const [productSearch, setProductSearch] = useState('')
  const [orderStatusFilter, setOrderStatusFilter] = useState('all')
  const [userRoleFilter, setUserRoleFilter] = useState('all')

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products')
      if (res.ok) {
        const data = await res.json()
        setProducts(data.products || [])
      }
    } catch (e) { console.error(e) }
  }, [])

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders')
      if (res.ok) {
        const data = await res.json()
        setOrders(data.orders || [])
      }
    } catch (e) { console.error(e) }
  }, [])

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
      }
    } catch (e) { console.error(e) }
  }, [])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      await Promise.all([fetchProducts(), fetchOrders(), fetchUsers()])
      setLoading(false)
    }
    load()
  }, [fetchProducts, fetchOrders, fetchUsers])

  const deleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: 'Product deleted' })
        fetchProducts()
      }
    } catch { toast({ title: 'Error deleting product', variant: 'destructive' }) }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        toast({ title: 'Order status updated' })
        fetchOrders()
      }
    } catch { toast({ title: 'Error updating order', variant: 'destructive' }) }
  }

  const toggleProductActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      })
      if (res.ok) {
        toast({ title: `Product ${!isActive ? 'activated' : 'deactivated'}` })
        fetchProducts()
      }
    } catch { toast({ title: 'Error updating product', variant: 'destructive' }) }
  }

  const filteredProducts = products.filter((p) =>
    !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase())
  )
  const filteredOrders = orders.filter((o) =>
    orderStatusFilter === 'all' || o.status === orderStatusFilter
  )
  const filteredUsers = users.filter((u) =>
    userRoleFilter === 'all' || u.role === userRoleFilter
  )

  const totalRevenue = orders.filter((o) => o.paymentStatus === 'COMPLETED').reduce((s, o) => s + o.finalAmount, 0)
  const isSuperAdmin = currentUser?.role === 'ADMIN'

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
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100 p-1 rounded-xl">
          <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <BarChart3 className="w-4 h-4 mr-1" /> Overview
          </TabsTrigger>
          <TabsTrigger value="products" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Package className="w-4 h-4 mr-1" /> Products
          </TabsTrigger>
          <TabsTrigger value="orders" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <ShoppingBag className="w-4 h-4 mr-1" /> Orders
          </TabsTrigger>
          {isSuperAdmin && (
            <TabsTrigger value="users" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Users className="w-4 h-4 mr-1" /> Users
            </TabsTrigger>
          )}
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard title="Total Orders" value={orders.length} icon={ShoppingBag} color="bg-orange-500" />
            <StatCard title="Revenue" value={Math.round(totalRevenue)} icon={DollarSign} color="bg-green-500" prefix="₹" />
            <StatCard title="Products" value={products.length} icon={Package} color="bg-amber-500" />
            <StatCard title="Users" value={users.length} icon={Users} color="bg-rose-500" />
          </div>

          {/* Recent orders */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{order.orderNumber}</p>
                      <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={cn('text-[10px]', statusColors[order.status] || 'bg-gray-100')}>
                        {order.status}
                      </Badge>
                      <span className="text-sm font-semibold">{formatINR(order.finalAmount)}</span>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No orders yet</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PRODUCTS TAB */}
        <TabsContent value="products" className="mt-4 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="relative flex-1 w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchProducts}>
                <RefreshCw className="w-3 h-3 mr-1" /> Refresh
              </Button>
              <AddProductModal onAdded={fetchProducts} />
            </div>
          </div>

          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {product.category === 'pizza' ? '🍕' : product.category === 'biryani' ? '🍛' :
                             product.category === 'burger' ? '🍔' : product.category === 'desserts' ? '🍰' : '🍽️'}
                          </span>
                          <div>
                            <p className="text-sm font-semibold line-clamp-1">{product.name}</p>
                            {product.isFeatured && <Badge className="text-[8px] bg-orange-100 text-orange-600 mt-0.5">Featured</Badge>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs capitalize">{product.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="font-semibold">{formatINR(product.discountPrice ?? product.price)}</span>
                          {product.discountPrice && (
                            <span className="text-xs text-gray-400 line-through ml-1">{formatINR(product.price)}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.stock <= 5 ? 'destructive' : 'secondary'} className="text-xs">
                          {product.stock}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn('text-xs cursor-pointer', product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}
                          onClick={() => toggleProductActive(product.id, product.isActive)}
                        >
                          {product.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteProduct(product.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredProducts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                        No products found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* ORDERS TAB */}
        <TabsContent value="orders" className="mt-4 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="PREPARING">Preparing</SelectItem>
                <SelectItem value="OUT_FOR_DELIVERY">Out for Delivery</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={fetchOrders}>
              <RefreshCw className="w-3 h-3 mr-1" /> Refresh
            </Button>
          </div>

          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Update</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium text-sm">{order.orderNumber}</TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </TableCell>
                      <TableCell className="font-semibold">{formatINR(order.finalAmount)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {order.paymentMethod} / {order.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn('text-[10px]', statusColors[order.status])}>
                          {order.status.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Select
                          value={order.status}
                          onValueChange={(v) => updateOrderStatus(order.id, v)}
                        >
                          <SelectTrigger className="w-32 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                            <SelectItem value="PREPARING">Preparing</SelectItem>
                            <SelectItem value="OUT_FOR_DELIVERY">Out for Delivery</SelectItem>
                            <SelectItem value="DELIVERED">Delivered</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredOrders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                        No orders found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* USERS TAB (Admin only) */}
        {isSuperAdmin && (
          <TabsContent value="users" className="mt-4 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="EMPLOYEE">Employee</SelectItem>
                  <SelectItem value="DELIVERY_PARTNER">Delivery Partner</SelectItem>
                  <SelectItem value="CUSTOMER">Customer</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={fetchUsers}>
                <RefreshCw className="w-3 h-3 mr-1" /> Refresh
              </Button>
            </div>

            <Card className="border-0 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-xs font-bold text-orange-600">
                              {(user.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{user.name}</p>
                              <p className="text-xs text-gray-400">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{user.phone || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn('text-xs', user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredUsers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                          No users found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
