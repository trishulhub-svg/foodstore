'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import AnimatedDelivery from './AnimatedDelivery'

const banners = [
  {
    title: 'Delicious Food,\nDelivered Fast',
    subtitle: 'Order from your favourite restaurants',
    gradient: 'from-orange-500 via-amber-500 to-yellow-400',
    cta: 'Order Now',
  },
  {
    title: 'Fresh Groceries\nat Your Door',
    subtitle: 'Get farm-fresh produce in 30 minutes',
    gradient: 'from-green-500 via-emerald-500 to-teal-400',
    cta: 'Shop Now',
  },
  {
    title: 'Late Night\nCravings?',
    subtitle: 'We deliver till 2 AM across the city',
    gradient: 'from-rose-500 via-pink-500 to-fuchsia-400',
    cta: 'Explore',
  },
]

export default function HeroSection() {
  const [currentBanner, setCurrentBanner] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const goTo = (index: number) => setCurrentBanner(index)
  const goNext = () => setCurrentBanner((prev) => (prev + 1) % banners.length)
  const goPrev = () => setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length)

  return (
    <section className="relative overflow-hidden rounded-2xl mx-4 mt-4">
      <div className="relative h-[200px] sm:h-[260px] md:h-[320px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBanner}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className={`absolute inset-0 bg-gradient-to-r ${banners[currentBanner].gradient} flex items-center`}
          >
            <div className="max-w-7xl mx-auto px-6 sm:px-10 w-full flex items-center justify-between">
              <div className="max-w-md">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl sm:text-3xl md:text-4xl font-bold text-white whitespace-pre-line leading-tight"
                >
                  {banners[currentBanner].title}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-white/80 mt-2 text-sm sm:text-base"
                >
                  {banners[currentBanner].subtitle}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-4"
                >
                  <Button className="bg-white text-gray-900 hover:bg-gray-100 font-semibold group">
                    {banners[currentBanner].cta}
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              </div>

              {/* Animated delivery bike on desktop */}
              <div className="hidden md:block w-64 h-20">
                <AnimatedDelivery />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Nav arrows */}
        <button
          onClick={goPrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/40 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-white" />
        </button>
        <button
          onClick={goNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/40 transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-white" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentBanner ? 'w-6 bg-white' : 'w-1.5 bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
