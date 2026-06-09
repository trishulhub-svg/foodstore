'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package, MapPin, Phone, Clock, CheckCircle, Truck,
  Navigation, Loader2, RefreshCw, ChevronRight, Bike,
  CircleDot, ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useStore, type Order } from '@/lib/store'
import { formatINR, cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

const trackingSteps = [
  { key: 'PICKED_UP', label: 'Picked Up', icon: Package },
  { key: 'ON_THE_WAY', label: 'On the Way', icon: Truck },
  { key: 'NEAR_LOCATION', label: 'Near Location', icon: MapPin },
  { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
]

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PREPARING: 'bg-orange-100 text-orange-700',
  OUT_FOR_DELIVERY: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

export default function DeliveryDashboard() {
  const { currentUser } = useStore()
  const { toast } = useToast()
  const [availableOrders, setAvailableOrders] = useState<Order[]>([])
  const [myDeliveries, setMyDeliveries] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [activeTab, setActiveTab] = useState('available')

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      // Available orders: CONFIRMED or PREPARING, no delivery partner assigned
      const res = await fetch('/api/orders?status=CONFIRMED')
      const res2 = await fetch('/api/orders?status=PREPARING')
      const data1 = await res.json()
      const data2 = await res2.json()
      const all = [...(data1.orders || []), ...(data2.orders || [])]
      setAvailableOrders(all.filter((o: Order) => !o.deliveryPartnerId))

      // My deliveries
      if (currentUser?.id) {
        const myRes = await fetch(`/api/orders?deliveryPartnerId=${currentUser.id}`)
        const myData = await myRes.json()
        setMyDeliveries((myData.orders || []).filter((o: Order) =>
          o.status === 'OUT_FOR_DELIVERY' || o.status === 'CONFIRMED' || o.status === 'PREPARING'
        ))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [currentUser?.id])

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 30000)
    return () => clearInterval(interval)
  }, [fetchOrders])

  const acceptDelivery = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'OUT_FOR_DELIVERY',
          deliveryPartnerId: currentUser?.id,
        }),
      })
      if (res.ok) {
        toast({ title: 'Delivery accepted!', description: 'Order is now out for delivery' })
        fetchOrders()
        setSelectedOrder(null)
      }
    } catch {
      toast({ title: 'Error accepting delivery', variant: 'destructive' })
    }
  }

  const updateTracking = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        toast({ title: 'Status updated!' })
        fetchOrders()
      }
    } catch {
      toast({ title: 'Error updating status', variant: 'destructive' })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          <Bike className="w-5 h-5 text-orange-500" />
          <h1 className="text-base sm:text-lg font-bold">Delivery Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[8px] sm:text-[9px] font-semibold text-gray-400 tracking-wider hidden sm:inline">
            by <span className="text-orange-500">TrishulHub</span>
          </span>
          <Button variant="outline" size="sm" onClick={fetchOrders}>
            <RefreshCw className="w-3 h-3 mr-1" /> Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100 p-1 rounded-xl w-full">
          <TabsTrigger value="available" className="rounded-lg flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Available ({availableOrders.length})
          </TabsTrigger>
          <TabsTrigger value="my-deliveries" className="rounded-lg flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            My Deliveries ({myDeliveries.length})
          </TabsTrigger>
        </TabsList>

        {/* Available Orders */}
        <TabsContent value="available" className="mt-4 space-y-3">
          {availableOrders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-700">No available orders</h3>
              <p className="text-sm text-gray-400 mt-1">New orders will appear here</p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {availableOrders.map((order, i) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1.5 sm:space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold">{order.orderNumber}</span>
                            <Badge className={cn('text-[10px]', statusColors[order.status])}>
                              {order.status.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500">
                            <p className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span className="line-clamp-1">{order.address?.addressLine1 || 'Address on file'}</span>
                            </p>
                            <p className="flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" />
                              {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <p className="font-bold text-orange-600">{formatINR(order.finalAmount)}</p>
                        </div>
                        <Button
                          onClick={() => acceptDelivery(order.id)}
                          className="bg-green-500 hover:bg-green-600 text-white w-full sm:w-auto"
                          size="sm"
                        >
                          Accept Delivery
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </TabsContent>

        {/* My Deliveries */}
        <TabsContent value="my-deliveries" className="mt-4 space-y-3">
          {myDeliveries.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-700">No active deliveries</h3>
              <p className="text-sm text-gray-400 mt-1">Accept an order to start delivering</p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {myDeliveries.map((order, i) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold">{order.orderNumber}</span>
                            <Badge className={cn('text-[10px]', statusColors[order.status])}>
                              {order.status.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            <MapPin className="w-3 h-3 inline mr-1" />
                            {order.address?.addressLine1 || 'Address on file'}
                          </p>
                          <p className="font-bold text-orange-600 mt-1">{formatINR(order.finalAmount)}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                        >
                          {selectedOrder?.id === order.id ? 'Hide' : 'Details'}
                        </Button>
                      </div>

                      {/* Tracking Steps */}
                      {selectedOrder?.id === order.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-t pt-4"
                        >
                          <div className="flex items-center justify-between mb-4">
                            {trackingSteps.map((step, stepIdx) => {
                              const isCompleted = stepIdx <= trackingSteps.findIndex(
                                (s) => s.key === (
                                  order.status === 'OUT_FOR_DELIVERY' ? 'ON_THE_WAY' :
                                  order.status === 'DELIVERED' ? 'DELIVERED' : 'PICKED_UP'
                                )
                              )
                              return (
                                <div key={step.key} className="flex flex-col items-center flex-1">
                                  <div className="flex items-center w-full">
                                    <motion.div
                                      initial={false}
                                      animate={{
                                        backgroundColor: isCompleted ? '#f97316' : '#e5e7eb',
                                        scale: isCompleted ? 1.1 : 1,
                                      }}
                                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                                    >
                                      <step.icon className="w-4 h-4 text-white" />
                                    </motion.div>
                                    {stepIdx < trackingSteps.length - 1 && (
                                      <div className={cn(
                                        'flex-1 h-0.5 mx-1',
                                        isCompleted ? 'bg-orange-500' : 'bg-gray-200'
                                      )} />
                                    )}
                                  </div>
                                  <span className="text-[10px] mt-1 text-center text-gray-500">
                                    {step.label}
                                  </span>
                                </div>
                              )
                            })}
                          </div>

                          <div className="flex gap-2">
                            {order.status === 'CONFIRMED' && (
                              <Button
                                onClick={() => updateTracking(order.id, 'OUT_FOR_DELIVERY')}
                                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                                size="sm"
                              >
                                Start Delivery
                              </Button>
                            )}
                            {order.status === 'PREPARING' && (
                              <Button
                                onClick={() => updateTracking(order.id, 'OUT_FOR_DELIVERY')}
                                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                                size="sm"
                              >
                                Picked Up - Start Delivery
                              </Button>
                            )}
                            {order.status === 'OUT_FOR_DELIVERY' && (
                              <>
                                <Button
                                  onClick={() => updateTracking(order.id, 'DELIVERED')}
                                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                                  size="sm"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" /> Mark Delivered
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Navigation className="w-4 h-4 mr-1" /> Update Location
                                </Button>
                              </>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
