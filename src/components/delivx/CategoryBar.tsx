'use client'

import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useStore, type Category } from '@/lib/store'

const defaultCategories: Category[] = [
  { id: 'all', name: 'All', icon: '🍽️', color: '#f97316', isActive: true, sortOrder: 0 },
  { id: 'pizza', name: 'Pizza', icon: '🍕', color: '#ef4444', isActive: true, sortOrder: 1 },
  { id: 'biryani', name: 'Biryani', icon: '🍛', color: '#f59e0b', isActive: true, sortOrder: 2 },
  { id: 'burger', name: 'Burger', icon: '🍔', color: '#8b5cf6', isActive: true, sortOrder: 3 },
  { id: 'chinese', name: 'Chinese', icon: '🥡', color: '#dc2626', isActive: true, sortOrder: 4 },
  { id: 'dosa', name: 'Dosa', icon: '🫓', color: '#16a34a', isActive: true, sortOrder: 5 },
  { id: 'north-indian', name: 'North Indian', icon: '🍲', color: '#ea580c', isActive: true, sortOrder: 6 },
  { id: 'desserts', name: 'Desserts', icon: '🍰', color: '#ec4899', isActive: true, sortOrder: 7 },
  { id: 'drinks', name: 'Drinks', icon: '🥤', color: '#06b6d4', isActive: true, sortOrder: 8 },
  { id: 'grocery', name: 'Grocery', icon: '🛒', color: '#22c55e', isActive: true, sortOrder: 9 },
]

interface CategoryBarProps {
  categories?: Category[]
}

export default function CategoryBar({ categories }: CategoryBarProps) {
  const { selectedCategory, setCategory } = useStore()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const cats = categories || defaultCategories

  const checkScroll = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setCanScrollLeft(scrollLeft > 10)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -200 : 200,
      behavior: 'smooth',
    })
  }

  return (
    <div className="relative px-4 py-4">
      {/* Scroll left button */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-2 overflow-x-auto scrollbar-hide py-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {cats.map((cat, i) => {
          const isActive = selectedCategory === cat.id || (!selectedCategory && cat.id === 'all')
          return (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCategory(cat.id === 'all' ? null : cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                isActive
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="text-base">{cat.icon}</span>
              {cat.name}
            </motion.button>
          )
        })}
      </div>

      {/* Scroll right button */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
