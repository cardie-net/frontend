"use client"

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react"
import { usePathname } from "next/navigation"

export type CornerPosition =
  "top-left" | "top-right" | "bottom-left" | "bottom-right"

interface NavbarContextValue {
  corner: CornerPosition
  setCorner: (corner: CornerPosition) => void
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  toggleOpen: () => void
  isDragging: boolean
  setIsDragging: React.Dispatch<React.SetStateAction<boolean>>
}

const NavbarContext = createContext<NavbarContextValue | null>(null)

export function NavbarProvider({ children }: { children: React.ReactNode }) {
  const [corner, setCornerState] = useState<CornerPosition>("top-right")
  const [isOpen, setIsOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const pathname = usePathname()

  // Load saved preference from localStorage
  useEffect(() => {
    void Promise.resolve().then(() => {
      try {
        const saved = localStorage.getItem(
          "cardie_navbar_corner"
        ) as CornerPosition | null
        if (
          saved &&
          ["top-left", "top-right", "bottom-left", "bottom-right"].includes(
            saved
          )
        ) {
          setCornerState(saved)
        }
      } catch {
        // Ignore localStorage errors
      }
    })
  }, [])

  const setCorner = useCallback((newCorner: CornerPosition) => {
    setCornerState(newCorner)
    try {
      localStorage.setItem("cardie_navbar_corner", newCorner)
    } catch {
      // Ignore localStorage errors
    }
  }, [])

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  // Close menu on route change
  useEffect(() => {
    void Promise.resolve().then(() => {
      setIsOpen(false)
    })
  }, [pathname])

  return (
    <NavbarContext.Provider
      value={{
        corner,
        setCorner,
        isOpen,
        setIsOpen,
        toggleOpen,
        isDragging,
        setIsDragging,
      }}
    >
      {children}
    </NavbarContext.Provider>
  )
}

export function useNavbar() {
  const context = useContext(NavbarContext)
  if (!context) {
    throw new Error("useNavbar must be used within a NavbarProvider")
  }
  return context
}
