"use client"

import React, { createContext, useContext, useMemo } from "react"
import { SessionProvider, useSession as useNextAuthSession } from "next-auth/react"

type Role = "ADMIN" | "EMPLOYEE" | "DELIVERY_PARTNER" | "CUSTOMER"

interface AuthContextType {
  user: {
    id?: string
    name?: string | null
    email?: string | null
    role?: Role
  } | null
  isAuthenticated: boolean
  isLoading: boolean
  role: Role | null
  hasRole: (role: Role) => boolean
}

const defaultContext: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  role: null,
  hasRole: () => false,
}

const AuthContext = createContext<AuthContextType>(defaultContext)

function AuthProviderInner({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useNextAuthSession()

  const authState = useMemo<AuthContextType>(() => {
    const isLoading = status === "loading"
    const isAuthenticated = status === "authenticated"

    if (isAuthenticated && session?.user) {
      const userRole = (session.user as any).role as Role | undefined
      const user = {
        id: (session.user as any).id as string | undefined,
        name: session.user.name,
        email: session.user.email,
        role: userRole,
      }

      return {
        user,
        isAuthenticated: true,
        isLoading: false,
        role: userRole ?? null,
        hasRole: (role: Role) => userRole === role,
      }
    }

    return {
      user: null,
      isAuthenticated: false,
      isLoading,
      role: null,
      hasRole: () => false,
    }
  }, [session, status])

  return (
    <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>
  )
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProviderInner>{children}</AuthProviderInner>
    </SessionProvider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
