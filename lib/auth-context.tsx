"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useSession } from "@/lib/auth-client"

interface User {
  id: string
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession()

  // Map Better Auth session to our existing interface for backward compatibility
  const user = session?.user
    ? {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
      }
    : null

  // These are no-ops now since Better Auth manages the session
  const setUser = () => {
    console.warn("setUser is deprecated with Better Auth - session is managed automatically")
  }

  const setToken = () => {
    console.warn("setToken is deprecated with Better Auth - session is managed automatically")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token: session?.session?.token || null,
        isLoading: isPending,
        setUser,
        setToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
