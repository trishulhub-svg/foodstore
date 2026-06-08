'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useStore } from '@/lib/store'
import { formatINR } from '@/lib/utils'

export default function CartDrawer() {
  const { cart, cartOpen, setCartOpen, removeFromCart, updateCartQuantity, cartTotal, setView, clearCart } = useStore()
  const total = cartTotal()
  const deliveryFee = total > 500 ? 0 : 40
  const discount = total > 1000 ? 100 : 0
  const finalTotal = total + deliveryFee - discount

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {cartOpen && (
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => setCartOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {cartOpen && (
          <motion.div
            key="cart-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-96 bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-orange-500" />
                <h2 className="font-bold text-lg">Your Cart</h2>
                <span className="text-sm text-gray-400">
                  ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)
                </span>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag className="w-10 h-10 text-orange-300" />
                  </div>
                  <h3 className="font-semibold text-gray-700">Your cart is empty</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Add some delicious items to get started
                  </p>
                  <Button
                    onClick={() => setCartOpen(false)}
                    className="mt-4 bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    Browse Menu
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {cart.map((item) => {
                      const price = item.product.discountPrice ?? item.product.price
                      return (
                        <motion.div
                          key={item.product.id}
                          layout
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20, height: 0 }}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                        >
                          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-lg flex items-center justify-center shrink-0 text-xl sm:text-2xl">
                            {item.product.category === 'pizza' ? '🍕' :
                             item.product.category === 'biryani' ? '🍛' :
                             item.product.category === 'burger' ? '🍔' :
                             item.product.category === 'chinese' ? '🥡' :
                             item.product.category === 'dosa' ? '🫓' :
                             item.product.category === 'desserts' ? '🍰' :
                             item.product.category === 'drinks' ? '🥤' : '🍽️'}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-800 line-clamp-1">
                              {item.product.name}
                            </h4>
                            <p className="text-sm text-orange-600 font-bold mt-0.5">
                              {formatINR(price * item.quantity)}
                            </p>
                          </div>

                          {/* Quantity controls - larger touch targets */}
                          <div className="flex items-center gap-0.5 shrink-0">
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                              className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-gray-200 hover:bg-gray-50 active:bg-gray-100"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </motion.button>
                            <span className="w-7 text-center text-sm font-semibold">
                              {item.quantity}
                            </span>
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                              className="w-9 h-9 flex items-center justify-center rounded-lg bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </motion.button>
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              onClick={() => removeFromCart(item.product.id)}
                              className="w-9 h-9 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 active:bg-red-100 ml-0.5"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </motion.button>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="border-t p-4 space-y-3 bg-white">
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatINR(total)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3 h-3" /> Delivery Fee
                    </span>
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

                {total < 500 && (
                  <p className="text-xs text-gray-400 text-center">
                    Add {formatINR(500 - total)} more for free delivery
                  </p>
                )}

                <Button
                  onClick={() => {
                    setCartOpen(false)
                    setView('checkout')
                  }}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold h-12"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <button
                  onClick={clearCart}
                  className="w-full text-center text-sm text-gray-400 hover:text-red-500 transition-colors py-2"
                >
                  Clear Cart
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
