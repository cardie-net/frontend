"use client"

import React from "react"
import { useTranslations } from "next-intl"
import { Sparkles } from "lucide-react"
import { useNavbar, CornerPosition } from "@/lib/NavbarContext"
import { cn } from "@/lib/utils"

export function HomeNavbarArrow() {
  const t = useTranslations("HomePage")
  const { corner, isOpen, toggleOpen } = useNavbar()

  // Position configs for each corner
  const cornerConfigs: Record<
    CornerPosition,
    {
      wrapper: string
      flexDirection: string
      animation: string
      svg: React.ReactNode
      labelRotation: string
    }
  > = {
    "top-right": {
      wrapper: "top-6 right-20 sm:top-7 sm:right-24 md:top-8 md:right-24",
      flexDirection: "flex-row items-center",
      animation: "animate-float-top-right",
      labelRotation: "-rotate-2",
      svg: (
        <svg
          viewBox="0 0 70 45"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-12 flex-shrink-0 text-primary drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)] filter sm:h-9 sm:w-14"
        >
          {/* Hand-drawn styled curved arrow path */}
          <path
            d="M 8 38 C 24 38, 44 32, 58 10"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="100"
            className="transition-all duration-300"
          />
          {/* Arrowhead */}
          <path
            d="M 44 9 L 60 8 L 60 23"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    "top-left": {
      wrapper: "top-6 left-20 sm:top-7 sm:left-24 md:top-8 md:left-24",
      flexDirection: "flex-row-reverse items-center",
      animation: "animate-float-top-left",
      labelRotation: "rotate-2",
      svg: (
        <svg
          viewBox="0 0 70 45"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-12 flex-shrink-0 text-primary drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)] filter sm:h-9 sm:w-14"
        >
          <path
            d="M 62 38 C 46 38, 26 32, 12 10"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M 26 9 L 10 8 L 10 23"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    "bottom-right": {
      wrapper:
        "bottom-6 right-20 sm:bottom-7 sm:right-24 md:bottom-8 md:right-24",
      flexDirection: "flex-row items-center",
      animation: "animate-float-bottom-right",
      labelRotation: "rotate-2",
      svg: (
        <svg
          viewBox="0 0 70 45"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-12 flex-shrink-0 text-primary drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)] filter sm:h-9 sm:w-14"
        >
          <path
            d="M 8 7 C 24 7, 44 13, 58 35"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M 44 36 L 60 37 L 60 22"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    "bottom-left": {
      wrapper: "bottom-6 left-20 sm:bottom-7 sm:left-24 md:bottom-8 md:left-24",
      flexDirection: "flex-row-reverse items-center",
      animation: "animate-float-bottom-left",
      labelRotation: "-rotate-2",
      svg: (
        <svg
          viewBox="0 0 70 45"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-12 flex-shrink-0 text-primary drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)] filter sm:h-9 sm:w-14"
        >
          <path
            d="M 62 7 C 46 7, 26 13, 12 35"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M 26 36 L 10 37 L 10 22"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
  }

  const currentConfig = cornerConfigs[corner] || cornerConfigs["top-right"]

  return (
    <div
      onClick={toggleOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          toggleOpen()
        }
      }}
      aria-label="Open navigation menu"
      className={cn(
        "group fixed z-40 cursor-pointer select-none",
        "transform-gpu transition-all duration-300 ease-out",
        currentConfig.wrapper,
        isOpen
          ? "pointer-events-none translate-y-1 scale-90 opacity-0"
          : "pointer-events-auto scale-100 opacity-100"
      )}
    >
      <div
        className={cn(
          "flex items-center gap-1.5 sm:gap-2",
          currentConfig.flexDirection,
          currentConfig.animation,
          "transition-transform duration-200 group-hover:scale-105 active:scale-95"
        )}
      >
        {/* Playful Pill Label */}
        <div
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-lg shadow-black/10",
            "border border-primary/30 bg-background/90 text-foreground backdrop-blur-md",
            "transition-all duration-200 group-hover:border-primary/60 group-hover:bg-accent/80 group-hover:shadow-primary/10",
            currentConfig.labelRotation
          )}
        >
          <Sparkles className="h-3.5 w-3.5 flex-shrink-0 animate-pulse text-primary" />
          <span className="font-medium tracking-tight whitespace-nowrap">
            {t("openMenuHint")}
          </span>
        </div>

        {/* Fun Curved SVG Arrow */}
        <div className="relative transform-gpu transition-transform duration-200 group-hover:scale-110">
          {currentConfig.svg}
        </div>
      </div>
    </div>
  )
}
