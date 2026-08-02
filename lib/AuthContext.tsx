"use client"

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react"
import { apiFetch } from "./api"
import { UserProfile } from "@/types"

export type { UserProfile }

interface AuthContextType {
  user: UserProfile | null
  loading: boolean
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    const response = await apiFetch(`/api/v1/users/me`)
    if (response.ok) {
      const data = await response.json()
      setUser(data)
    } else {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    // Keep every setState inside a promise callback so the effect never sets
    // state synchronously (react-hooks/set-state-in-effect).
    let cancelled = false
    void apiFetch(`/api/v1/users/me`)
      .then(async (response) => {
        if (cancelled) return
        setUser(response.ok ? await response.json() : null)
      })
      .catch((error) => {
        if (cancelled) return
        console.error("Failed to fetch user:", error)
        setUser(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const logout = async () => {
    try {
      await apiFetch("/api/v1/auth/jwt/logout", { method: "POST" })
    } catch (error) {
      console.error("Failed to logout:", error)
    }
    setUser(null)
    window.location.href = "/"
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, logout, refreshUser: fetchUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
