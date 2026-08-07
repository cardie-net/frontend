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
import { useCustomTheme } from "@/components/theme/custom-theme-provider"
import { setLocale } from "@/app/actions"

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

  const { importThemeJson } = useCustomTheme()

  const syncPreferences = useCallback((userData: UserProfile) => {
    if (userData.preferences) {
      if (userData.preferences.themeConfig) {
        // Prevent infinite loop if updateConfig triggers a patch
        // But our debounce logic in updateConfig will fire a PATCH, which is harmless (just resaves the same config).
        // Actually, to be safe, we could check if it's different, but for now we just apply it.
        importThemeJson(JSON.stringify(userData.preferences.themeConfig))
      }
      if (userData.preferences.language) {
        if (!document.cookie.includes(`NEXT_LOCALE=${userData.preferences.language}`)) {
          void setLocale(userData.preferences.language).then(() => {})
        }
      }
    }
  }, [importThemeJson])

  const fetchUser = useCallback(async () => {
    const response = await apiFetch(`/api/v1/users/me`)
    if (response.ok) {
      const data = await response.json()
      setUser(data)
      syncPreferences(data)
    } else {
      setUser(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // Keep every setState inside a promise callback so the effect never sets
    // state synchronously (react-hooks/set-state-in-effect).
    let cancelled = false
    void apiFetch(`/api/v1/users/me`)
      .then(async (response) => {
        if (cancelled) return
        if (response.ok) {
          const data = await response.json()
          setUser(data)
          syncPreferences(data)
        } else {
          setUser(null)
        }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
