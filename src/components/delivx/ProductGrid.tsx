'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, Loader2, SearchX } from 'lucide-react'
import { useStore, type Product } from '@/lib/store'
import ProductCard from './ProductCard'

interface ProductGridProps {
  products?: Product[]
  loading?: boolean
}

export default function ProductGrid({ products: propProducts, loading: propLoading }: ProductGridProps) {
  const { selectedCategory, searchQuery } = useStore()
  const [products, setProducts] = useState<Product[]>(propProducts || [])
  const [loading, setLoading] = useState(propLoading ?? true)

  useEffect(() => {
    if (propProducts) {
      setProducts(propProducts)
      setLoading(false)
      return
    }
    fetchProducts()
  }, [propProducts])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/products')
      if (res.ok) {
        const data = await res.json()
        setProducts(data.products || [])
      }
    } catch (err) {
      console.error('Failed to fetch products:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter((p) => {
    const matchesCategory = !selectedCategory || p.category === selectedCategory || selectedCategory === 'all'
    const matchesSearch = !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch && p.isActive
  })

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 px-4 py-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-2xl animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-t-2xl" />
            <div className="p-3 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (filteredProducts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-16 px-4"
      >
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          {searchQuery ? (
            <SearchX className="w-8 h-8 text-gray-400" />
          ) : (
            <Package className="w-8 h-8 text-gray-400" />
          )}
        </div>
        <h3 className="text-lg font-semibold text-gray-700">
          {searchQuery ? 'No results found' : 'No products available'}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          {searchQuery
            ? `No products matching "${searchQuery}"`
            : 'Check back later for new items'}
        </p>
      </motion.div>
    )
  }

  return (
    <div className="px-4 py-2">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-gray-900">
          {selectedCategory ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1) : 'All Products'}
          <span className="text-sm font-normal text-gray-400 ml-2">
            ({filteredProducts.length} items)
          </span>
        </h2>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedCategory || 'all'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
        >
          {filteredProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
