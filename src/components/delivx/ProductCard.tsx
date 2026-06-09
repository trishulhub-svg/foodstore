'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Minus, Heart, Star, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useStore, type Product } from '@/lib/store'
import { formatINR, cn } from '@/lib/utils'

interface ProductCardProps {
  product: Product
  index?: number
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { cart, addToCart, removeFromCart, updateCartQuantity } = useStore()
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [addedAnimation, setAddedAnimation] = useState(false)

  const cartItem = cart.find((item) => item.product.id === product.id)
  const quantity = cartItem?.quantity || 0
  const discountedPrice = product.discountPrice ?? product.price
  const discountPercent = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0

  const handleAdd = () => {
    addToCart(product)
    setAddedAnimation(true)
    setTimeout(() => setAddedAnimation(false), 600)
  }

  const emojiMap: Record<string, string> = {
    pizza: '🍕', biryani: '🍛', burger: '🍔', chinese: '🥡',
    dosa: '🫓', 'north-indian': '🍲', desserts: '🍰', drinks: '🥤',
    grocery: '🛒', default: '🍽️',
  }
  const emoji = emojiMap[product.category] || emojiMap.default

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-shadow group"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gradient-to-br from-orange-50 to-amber-50 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl sm:text-6xl group-hover:scale-110 transition-transform duration-300">
            {emoji}
          </span>
        </div>

        {/* Discount badge */}
        {discountPercent > 0 && (
          <Badge className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-green-500 text-white text-[9px] sm:text-[10px] font-bold px-1 sm:px-1.5 py-0.5">
            {discountPercent}% OFF
          </Badge>
        )}

        {/* Featured badge */}
        {product.isFeatured && (
          <Badge className="absolute top-1.5 right-9 sm:top-2 sm:right-10 bg-orange-500 text-white text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5">
            <Star className="w-2 h-2 sm:w-2.5 sm:h-2.5 mr-0.5 fill-current" /> Featured
          </Badge>
        )}

        {/* Wishlist - Larger touch target for mobile */}
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={() => setIsWishlisted(!isWishlisted)}
          className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-full shadow-sm"
        >
          <Heart
            className={cn(
              'w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors',
              isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'
            )}
          />
        </motion.button>

        {/* Stock indicator */}
        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 text-[9px] sm:text-[10px] bg-red-500 text-white px-1.5 sm:px-2 py-0.5 rounded-full">
            Only {product.stock} left!
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-800 px-3 py-1 rounded-full text-xs font-semibold">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2 sm:p-3">
        <h3 className="font-semibold text-xs sm:text-sm text-gray-900 line-clamp-1">{product.name}</h3>
        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 line-clamp-1">{product.description}</p>

        <div className="flex items-end justify-between mt-1.5 sm:mt-2">
          {/* Price */}
          <div className="min-w-0">
            <span className="font-bold text-sm sm:text-base text-gray-900">
              {formatINR(discountedPrice)}
            </span>
            {product.discountPrice && (
              <span className="text-[10px] sm:text-[11px] text-gray-400 line-through ml-0.5">
                {formatINR(product.price)}
              </span>
            )}
            <p className="text-[9px] sm:text-[10px] text-gray-400">per {product.unit}</p>
          </div>

          {/* Add to cart - Larger touch targets */}
          {product.stock > 0 && (
            <div className="relative shrink-0">
              {quantity === 0 ? (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleAdd}
                  className="w-9 h-9 sm:w-11 sm:h-11 bg-orange-500 hover:bg-orange-600 text-white rounded-lg sm:rounded-xl flex items-center justify-center shadow-md shadow-orange-200 transition-colors"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>
              ) : (
                <div className="flex items-center gap-0.5 bg-orange-50 rounded-lg sm:rounded-xl px-0.5 sm:px-1 py-0.5">
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => updateCartQuantity(product.id, quantity - 1)}
                    className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-orange-600 hover:bg-orange-100 rounded-lg active:bg-orange-200"
                  >
                    <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </motion.button>
                  <motion.span
                    key={quantity}
                    initial={{ scale: 1.5 }}
                    animate={{ scale: 1 }}
                    className="text-xs sm:text-sm font-bold text-orange-600 min-w-[18px] sm:min-w-[20px] text-center"
                  >
                    {quantity}
                  </motion.span>
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={handleAdd}
                    className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-orange-600 hover:bg-orange-100 rounded-lg active:bg-orange-200"
                  >
                    <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </motion.button>
                </div>
              )}

              {/* +1 animation */}
              {addedAnimation && (
                <motion.div
                  initial={{ opacity: 1, y: 0 }}
                  animate={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.6 }}
                  className="absolute -top-2 right-0 text-orange-500 font-bold text-sm"
                >
                  +1
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
