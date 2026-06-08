'use client'

import { create } from 'zustand'

export type UserRole = 'ADMIN' | 'EMPLOYEE' | 'DELIVERY_PARTNER' | 'CUSTOMER'

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: UserRole
  avatar?: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  discountPrice: number | null
  category: string
  images: string
  stock: number
  unit: string
  isActive: boolean
  isFeatured: boolean
  createdAt: string
  updatedAt: string
  userId: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  isActive: boolean
  sortOrder: number
}

export interface Address {
  id: string
  userId: string
  label: 'HOME' | 'OFFICE' | 'OTHER'
  fullName: string
  phone: string
  addressLine1: string
  addressLine2: string | null
  city: string
  state: string
  pincode: string
  landmark: string | null
  isDefault: boolean
  latitude: number | null
  longitude: number | null
}

export interface OrderItem {
  id: string
  productId: string
  productName: string
  quantity: number
  price: number
  totalPrice: number
}

export interface Order {
  id: string
  orderNumber: string
  userId: string
  addressId: string
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED'
  totalAmount: number
  deliveryFee: number
  discount: number
  finalAmount: number
  paymentMethod: 'COD' | 'ONLINE'
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
  deliveryPartnerId: string | null
  deliveredAt: string | null
  cancelledAt: string | null
  cancelReason: string | null
  createdAt: string
  updatedAt: string
  address?: Address
  orderItems?: OrderItem[]
  deliveryPartner?: User
  user?: User
}

export type AppView = 'home' | 'admin' | 'delivery' | 'account' | 'checkout' | 'orders'

interface AppState {
  // Auth
  currentUser: User | null
  isAuthenticated: boolean

  // Navigation
  currentView: AppView
  previousView: AppView | null

  // Cart
  cart: CartItem[]
  cartOpen: boolean

  // Filters
  selectedCategory: string | null
  searchQuery: string

  // UI
  signInOpen: boolean

  // Computed
  cartTotal: () => number
  cartItemCount: () => number
  isAdmin: () => boolean
  isDeliveryPartner: () => boolean

  // Actions
  setUser: (user: User | null) => void
  setView: (view: AppView) => void
  setCategory: (category: string | null) => void
  setSearch: (query: string) => void
  setCartOpen: (open: boolean) => void
  setSignInOpen: (open: boolean) => void
  addToCart: (product: Product) => void
  removeFromCart: (productId: string) => void
  updateCartQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  goToPreviousView: () => void
}

export const useStore = create<AppState>((set, get) => ({
  // Auth
  currentUser: null,
  isAuthenticated: false,

  // Navigation
  currentView: 'home',
  previousView: null,

  // Cart
  cart: [],
  cartOpen: false,

  // Filters
  selectedCategory: null,
  searchQuery: '',

  // UI
  signInOpen: false,

  // Computed
  cartTotal: () => {
    const { cart } = get()
    return cart.reduce((total, item) => {
      const price = item.product.discountPrice ?? item.product.price
      return total + price * item.quantity
    }, 0)
  },

  cartItemCount: () => {
    const { cart } = get()
    return cart.reduce((count, item) => count + item.quantity, 0)
  },

  isAdmin: () => {
    const { currentUser } = get()
    return currentUser?.role === 'ADMIN' || currentUser?.role === 'EMPLOYEE'
  },

  isDeliveryPartner: () => {
    const { currentUser } = get()
    return currentUser?.role === 'DELIVERY_PARTNER'
  },

  // Actions
  setUser: (user) => set({ currentUser: user, isAuthenticated: !!user }),

  setView: (view) =>
    set((state) => ({
      previousView: state.currentView,
      currentView: view,
    })),

  setCategory: (category) => set({ selectedCategory: category }),

  setSearch: (query) => set({ searchQuery: query }),

  setCartOpen: (open) => set({ cartOpen: open }),

  setSignInOpen: (open) => set({ signInOpen: open }),

  addToCart: (product) =>
    set((state) => {
      const existing = state.cart.find((item) => item.product.id === product.id)
      if (existing) {
        return {
          cart: state.cart.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        }
      }
      return { cart: [...state.cart, { product, quantity: 1 }] }
    }),

  removeFromCart: (productId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.product.id !== productId),
    })),

  updateCartQuantity: (productId, quantity) =>
    set((state) => {
      if (quantity <= 0) {
        return { cart: state.cart.filter((item) => item.product.id !== productId) }
      }
      return {
        cart: state.cart.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        ),
      }
    }),

  clearCart: () => set({ cart: [] }),

  goToPreviousView: () =>
    set((state) => ({
      currentView: state.previousView || 'home',
      previousView: null,
    })),
}))
