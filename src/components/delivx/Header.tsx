'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, ShoppingCart, User, Bike, LogOut, Settings, Package,
  ChevronDown, Menu, X, LayoutDashboard, Truck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useStore, type AppView } from '@/lib/store'
import { signOut, useSession } from 'next-auth/react'
import { formatINR } from '@/lib/utils'

const navItems: { view: AppView; label: string; icon: React.ElementType; roles: string[] }[] = [
  { view: 'home', label: 'Home', icon: Bike, roles: ['CUSTOMER', 'ADMIN', 'EMPLOYEE', 'DELIVERY_PARTNER'] },
  { view: 'admin', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'EMPLOYEE'] },
  { view: 'delivery', label: 'Deliveries', icon: Truck, roles: ['DELIVERY_PARTNER'] },
  { view: 'orders', label: 'My Orders', icon: Package, roles: ['CUSTOMER'] },
  { view: 'account', label: 'Account', icon: User, roles: ['CUSTOMER', 'ADMIN', 'EMPLOYEE', 'DELIVERY_PARTNER'] },
]

export default function Header() {
  const { currentView, setView, cartOpen, setCartOpen, setSearch, searchQuery, currentUser, setSignInOpen } = useStore()
  const cartItemCount = useStore((s) => s.cartItemCount())
  const cartTotal = useStore((s) => s.cartTotal())
  const { data: session } = useSession()
  const [searchExpanded, setSearchExpanded] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (searchExpanded && searchRef.current) {
      searchRef.current.focus()
    }
  }, [searchExpanded])

  const userRole = (currentUser?.role || session?.user?.role || 'CUSTOMER') as string
  const filteredNavItems = navItems.filter((item) => item.roles.includes(userRole))

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    window.location.reload()
  }

  const initials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0"
            onClick={() => setView('home')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                <Bike className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
            </motion.div>
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
                FoodStore
              </span>
              <span className="text-[7px] sm:text-[9px] font-bold bg-gradient-to-r from-gray-900 to-gray-700 text-white px-1 sm:px-1.5 py-0.5 rounded-md tracking-wide border border-gray-600 whitespace-nowrap">
                by TrishulHub
              </span>
            </div>
          </motion.div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 ml-8">
            {filteredNavItems.map((item) => (
              <motion.button
                key={item.view}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setView(item.view)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  currentView === item.view
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </motion.button>
            ))}
          </nav>

          {/* Search */}
          <div className="flex-1 max-w-md mx-2 sm:mx-4 hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                ref={searchRef}
                placeholder="Search for food, groceries..."
                value={searchQuery}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200 focus:border-orange-300 focus:ring-orange-200"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Mobile Search Toggle */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setSearchExpanded(!searchExpanded)}
              className="sm:hidden p-2 rounded-xl hover:bg-gray-100"
            >
              {searchExpanded ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </motion.button>

            {/* Cart */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setCartOpen(!cartOpen)}
              className="relative p-2 rounded-xl hover:bg-orange-50 transition-colors"
            >
              <motion.div
                key={cartItemCount}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              >
                <ShoppingCart className="w-5 h-5 text-gray-700" />
              </motion.div>
              {cartItemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1"
                >
                  {cartItemCount}
                </motion.span>
              )}
            </motion.button>

            {/* User Menu */}
            {session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 p-1.5 rounded-xl hover:bg-gray-50 transition-colors">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-orange-100 text-orange-600 text-xs font-semibold">
                        {initials(session.user.name || 'U')}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="w-3 h-3 text-gray-400 hidden sm:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">{session.user.name}</p>
                    <p className="text-xs text-gray-500">{session.user.email}</p>
                    <Badge variant="secondary" className="mt-1 text-[10px]">
                      {session.user.role}
                    </Badge>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setView('account')}>
                    <User className="w-4 h-4 mr-2" /> My Account
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setView('orders')}>
                    <Package className="w-4 h-4 mr-2" /> My Orders
                  </DropdownMenuItem>
                  {userRole === 'ADMIN' && (
                    <DropdownMenuItem onClick={() => setView('admin')}>
                      <Settings className="w-4 h-4 mr-2" /> Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={() => setSignInOpen(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white text-sm"
                size="sm"
              >
                Sign In
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <AnimatePresence>
          {searchExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="sm:hidden overflow-hidden pb-3"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search for food..."
                  value={searchQuery}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                  autoFocus
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t border-gray-100"
            >
              <div className="py-2 space-y-1">
                {filteredNavItems.map((item) => (
                  <button
                    key={item.view}
                    onClick={() => {
                      setView(item.view)
                      setMobileMenuOpen(false)
                    }}
                    className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                      currentView === item.view
                        ? 'bg-orange-50 text-orange-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
