'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Home, Grid3X3, ShoppingCart, Package, User } from 'lucide-react'
import { useStore, type AppView } from '@/lib/store'

const navItems: { view: AppView; label: string; icon: React.ElementType }[] = [
  { view: 'home', label: 'Home', icon: Home },
  { view: 'home', label: 'Browse', icon: Grid3X3 },
  { view: 'checkout', label: 'Cart', icon: ShoppingCart },
  { view: 'orders', label: 'Orders', icon: Package },
  { view: 'account', label: 'Profile', icon: User },
]

export default function BottomNav() {
  const { currentView, setView, cartOpen, setCartOpen } = useStore()
  const cartItemCount = useStore((s) => s.cartItemCount())

  const isActive = (view: AppView, label: string) => {
    if (label === 'Cart') return cartOpen
    return currentView === view
  }

  const handleClick = (view: AppView, label: string) => {
    if (label === 'Cart') {
      setCartOpen(!cartOpen)
    } else {
      setView(view)
    }
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-100 md:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-around h-14 sm:h-16 max-w-lg mx-auto relative">
        {navItems.map((item) => {
          const active = isActive(item.view, item.label)
          return (
            <button
              key={item.label}
              onClick={() => handleClick(item.view, item.label)}
              className="flex flex-col items-center justify-center w-16 h-full relative"
            >
              {active && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute top-0 w-8 h-1 bg-orange-500 rounded-b-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <motion.div
                animate={{
                  scale: active ? 1.1 : 1,
                  color: active ? '#f97316' : '#9ca3af',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="relative"
              >
                <item.icon className="w-5 h-5" />
                {item.label === 'Cart' && cartItemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-2 min-w-[16px] h-4 bg-orange-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1"
                  >
                    {cartItemCount}
                  </motion.span>
                )}
              </motion.div>
              <span
                className={`text-[10px] mt-0.5 font-medium ${
                  active ? 'text-orange-500' : 'text-gray-400'
                }`}
              >
                {item.label}
              </span>
            </button>
          )
        })}
        {/* TrishulHub branding in BottomNav */}
        <div className="absolute -top-5 right-2">
          <a
            href="https://trishulhub.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[8px] font-semibold text-gray-300 hover:text-orange-400 tracking-wider transition-colors"
          >
            TrishulHub
          </a>
        </div>
      </div>
      <div className="pb-[env(safe-area-inset-bottom)]" />
    </nav>
  )
}
