'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  CheckCircle, Circle, Truck, MapPin, Clock, Phone, User,
  Package, Navigation,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useStore, type Order } from '@/lib/store'
import { formatINR, cn } from '@/lib/utils'

const orderSteps = [
  { key: 'PENDING', label: 'Order Placed', icon: Package },
  { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle },
  { key: 'PREPARING', label: 'Preparing', icon: Clock },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
]

const statusOrder = ['PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED']

export default function OrderTracking({ order }: { order: Order }) {
  const currentStepIndex = statusOrder.indexOf(order.status)
  const isCancelled = order.status === 'CANCELLED'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Order Header */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base">{order.orderNumber}</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: '2-digit', month: 'long', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>
            <div className="text-right">
              <Badge className={cn(
                'text-xs',
                isCancelled ? 'bg-red-100 text-red-700' :
                order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                'bg-orange-100 text-orange-700'
              )}>
                {order.status.replace(/_/g, ' ')}
              </Badge>
              <p className="font-bold text-orange-600 mt-1">{formatINR(order.finalAmount)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tracking Timeline */}
      {!isCancelled && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <h4 className="font-semibold text-sm mb-4">Order Status</h4>
            <div className="space-y-0">
              {orderSteps.map((step, index) => {
                const isCompleted = index <= currentStepIndex
                const isCurrent = index === currentStepIndex
                return (
                  <div key={step.key} className="flex items-start gap-3">
                    {/* Timeline dot and line */}
                    <div className="flex flex-col items-center">
                      <motion.div
                        initial={false}
                        animate={{
                          scale: isCurrent ? 1.2 : 1,
                          backgroundColor: isCompleted ? '#f97316' : '#e5e7eb',
                        }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                      >
                        <step.icon className="w-4 h-4 text-white" />
                      </motion.div>
                      {index < orderSteps.length - 1 && (
                        <div className={cn(
                          'w-0.5 h-8',
                          index < currentStepIndex ? 'bg-orange-500' : 'bg-gray-200'
                        )} />
                      )}
                    </div>
                    {/* Label */}
                    <div className="pt-1">
                      <p className={cn(
                        'text-sm font-medium',
                        isCompleted ? 'text-gray-900' : 'text-gray-400'
                      )}>
                        {step.label}
                      </p>
                      {isCurrent && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-xs text-orange-500"
                        >
                          Current status
                        </motion.p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Tracking Map Placeholder */}
      {order.status === 'OUT_FOR_DELIVERY' && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <h4 className="font-semibold text-sm mb-3">Live Tracking</h4>
            <div className="relative h-40 bg-gradient-to-br from-orange-50 to-green-50 rounded-xl overflow-hidden">
              {/* Animated dotted path */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 150">
                <path
                  d="M40,120 C80,120 100,60 150,60 S220,90 260,40"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                  opacity="0.4"
                />
                <path
                  d="M40,120 C80,120 100,60 150,60 S220,90 260,40"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                  strokeDashoffset="0"
                >
                  <animate
                    attributeName="strokeDashoffset"
                    from="0"
                    to="-20"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                </path>
                {/* Start point */}
                <circle cx="40" cy="120" r="6" fill="#f97316" />
                <text x="40" y="135" textAnchor="middle" fontSize="8" fill="#9ca3af">Restaurant</text>
                {/* Delivery bike on path */}
                <circle r="5" fill="#22c55e">
                  <animateMotion
                    dur="4s"
                    repeatCount="indefinite"
                    path="M40,120 C80,120 100,60 150,60 S220,90 260,40"
                  />
                </circle>
                {/* End point */}
                <circle cx="260" cy="40" r="6" fill="#ef4444" />
                <text x="260" y="30" textAnchor="middle" fontSize="8" fill="#9ca3af">Your Location</text>
              </svg>
              <div className="absolute bottom-2 left-2 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] text-gray-600">
                📍 Live tracking active
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delivery Partner Info */}
      {order.deliveryPartnerId && order.status !== 'DELIVERED' && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <h4 className="font-semibold text-sm mb-3">Delivery Partner</h4>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Delivery Partner</p>
                  <p className="text-xs text-gray-400">On the way to you</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="w-9 h-9 p-0">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" className="w-9 h-9 p-0">
                  <Navigation className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Items */}
      {order.orderItems && order.orderItems.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <h4 className="font-semibold text-sm mb-3">Order Items</h4>
            <div className="space-y-2">
              {order.orderItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-orange-100 rounded text-[10px] flex items-center justify-center font-bold text-orange-600">
                      {item.quantity}
                    </span>
                    <span className="text-gray-700">{item.productName}</span>
                  </div>
                  <span className="font-medium">{formatINR(item.totalPrice)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estimated Delivery */}
      {!isCancelled && order.status !== 'DELIVERED' && (
        <Card className="border-0 shadow-sm bg-gradient-to-r from-orange-50 to-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm font-semibold text-gray-800">Estimated Delivery</p>
                <p className="text-xs text-gray-500">
                  {order.status === 'OUT_FOR_DELIVERY'
                    ? 'Arriving in 15-20 mins'
                    : order.status === 'PREPARING'
                    ? '30-40 mins'
                    : '40-50 mins'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  )
}
