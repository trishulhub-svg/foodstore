'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, MapPin, CreditCard, Banknote, Truck, ShoppingBag,
  CheckCircle, Loader2, ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { useStore } from '@/lib/store'
import { formatINR, cn, generateOrderNumber } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import AddressManager from './AddressManager'

type CheckoutStep = 'address' | 'payment' | 'summary' | 'success'

export default function CheckoutFlow() {
  const { cart, cartTotal, setView, setCartOpen, clearCart, currentUser } = useStore()
  const { toast } = useToast()
  const [step, setStep] = useState<CheckoutStep>('address')
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE'>('COD')
  const [placing, setPlacing] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')

  const subtotal = cartTotal()
  const deliveryFee = subtotal > 500 ? 0 : 40
  const discount = subtotal > 1000 ? 100 : 0
  const finalTotal = subtotal + deliveryFee - discount

  const steps: { key: CheckoutStep; label: string; icon: React.ElementType }[] = [
    { key: 'address', label: 'Address', icon: MapPin },
    { key: 'payment', label: 'Payment', icon: CreditCard },
    { key: 'summary', label: 'Summary', icon: ShoppingBag },
  ]

  const currentStepIndex = steps.findIndex((s) => s.key === step)

  const canProceed = () => {
    if (step === 'address') return !!selectedAddressId
    if (step === 'payment') return !!paymentMethod
    return true
  }

  const handleNext = () => {
    if (step === 'address') setStep('payment')
    else if (step === 'payment') setStep('summary')
  }

  const handleBack = () => {
    if (step === 'payment') setStep('address')
    else if (step === 'summary') setStep('payment')
  }

  const placeOrder = async () => {
    if (!selectedAddressId) return
    setPlacing(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          addressId: selectedAddressId,
          paymentMethod,
          items: cart.map((item) => ({
            productId: item.product.id,
            productName: item.product.name,
            quantity: item.quantity,
            price: item.product.discountPrice ?? item.product.price,
          })),
          totalAmount: subtotal,
          deliveryFee,
          discount,
          finalAmount: finalTotal,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setOrderNumber(data.order?.orderNumber || generateOrderNumber())
        setStep('success')
        clearCart()
      } else {
        const data = await res.json()
        toast({ title: 'Error placing order', description: data.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error placing order', variant: 'destructive' })
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (step === 'address') {
              setView('home')
              setCartOpen(true)
            } else {
              handleBack()
            }
          }}
          className="w-9 h-9 p-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-lg font-bold">Checkout</h1>
      </div>

      {/* Step Indicator */}
      {step !== 'success' && (
        <div className="flex items-center gap-2 mb-6">
          {steps.map((s, i) => (
            <React.Fragment key={s.key}>
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{
                    backgroundColor: i <= currentStepIndex ? '#f97316' : '#e5e7eb',
                    scale: i === currentStepIndex ? 1.1 : 1,
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                >
                  <s.icon className="w-4 h-4 text-white" />
                </motion.div>
                <span className={cn(
                  'text-xs font-medium hidden sm:block',
                  i <= currentStepIndex ? 'text-orange-600' : 'text-gray-400'
                )}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={cn(
                  'flex-1 h-0.5',
                  i < currentStepIndex ? 'bg-orange-500' : 'bg-gray-200'
                )} />
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* ADDRESS STEP */}
        {step === 'address' && (
          <motion.div
            key="address"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <AddressManager
              selectable
              selectedAddressId={selectedAddressId}
              onSelectAddress={setSelectedAddressId}
            />
            <div className="mt-6">
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12"
              >
                Continue to Payment
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* PAYMENT STEP */}
        {step === 'payment' && (
          <motion.div
            key="payment"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm mb-4">Select Payment Method</h3>
                <RadioGroup value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)}>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-orange-300 cursor-pointer transition-colors">
                      <RadioGroupItem value="COD" />
                      <Banknote className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">Cash on Delivery</p>
                        <p className="text-xs text-gray-400">Pay when your order arrives</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-orange-300 cursor-pointer transition-colors">
                      <RadioGroupItem value="ONLINE" />
                      <CreditCard className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="text-sm font-medium">Online Payment</p>
                        <p className="text-xs text-gray-400">UPI, Cards, Wallets (Razorpay)</p>
                      </div>
                    </label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {paymentMethod === 'COD' && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
                <Truck className="w-4 h-4 text-green-600" />
                <p className="text-xs text-green-700">No additional charges for Cash on Delivery</p>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleNext}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              >
                Review Order
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* SUMMARY STEP */}
        {step === 'summary' && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm mb-3">Order Summary</h3>
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-base">
                          {item.product.category === 'pizza' ? '🍕' :
                           item.product.category === 'biryani' ? '🍛' :
                           item.product.category === 'burger' ? '🍔' : '🍽️'}
                        </span>
                        <span className="text-gray-700 line-clamp-1">{item.product.name}</span>
                        <Badge variant="secondary" className="text-[10px]">x{item.quantity}</Badge>
                      </div>
                      <span className="font-medium">
                        {formatINR((item.product.discountPrice ?? item.product.price) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <Separator className="my-3" />
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatINR(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span className={deliveryFee === 0 ? 'text-green-500' : ''}>
                      {deliveryFee === 0 ? 'FREE' : formatINR(deliveryFee)}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{formatINR(discount)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span>{formatINR(finalTotal)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium">Delivering to selected address</span>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">{paymentMethod}</Badge>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
              <Button
                onClick={placeOrder}
                disabled={placing}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white h-12"
              >
                {placing ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Placing Order...</>
                ) : (
                  <>Place Order • {formatINR(finalTotal)}</>
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {/* SUCCESS STEP */}
        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.2 }}
              className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-12 h-12 text-green-500" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-2xl font-bold text-gray-800"
            >
              Order Placed! 🎉
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-gray-500 mt-2"
            >
              Your order has been placed successfully
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-4"
            >
              <Badge className="text-sm bg-orange-100 text-orange-700 px-4 py-1.5">
                {orderNumber}
              </Badge>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-8 space-y-3"
            >
              <Button
                onClick={() => setView('orders')}
                className="bg-orange-500 hover:bg-orange-600 text-white w-full max-w-xs"
              >
                Track Your Order
              </Button>
              <div>
                <Button
                  variant="outline"
                  onClick={() => setView('home')}
                  className="w-full max-w-xs"
                >
                  Continue Shopping
                </Button>
              </div>
            </motion.div>

            {/* Confetti-like animation */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    opacity: 1,
                    y: -20,
                    x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400),
                  }}
                  animate={{
                    opacity: 0,
                    y: typeof window !== 'undefined' ? window.innerHeight + 50 : 800,
                    rotate: Math.random() * 360,
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    delay: Math.random() * 0.5,
                    ease: 'easeOut',
                  }}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: ['#f97316', '#22c55e', '#eab308', '#ef4444', '#ec4899'][i % 5],
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
