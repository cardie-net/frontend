"use client"

import React from "react"
import { Flame, Sparkles, Clock, Search } from "lucide-react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

export type CommunitySortMode = "popular" | "created" | "updated" | "search"

export interface ModeButtonConfig {
  id: CommunitySortMode
  labelKey: string
  subtitleKey: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  bgClasses: string
  iconColor: string
  borderColor: string
  activeRing: string
}

export const COMMUNITY_MODES: ModeButtonConfig[] = [
  {
    id: "popular",
    labelKey: "popular",
    subtitleKey: "popularSubtitle",
    icon: Flame,
    bgClasses:
      "bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20 hover:from-amber-500/20 hover:to-orange-500/20 dark:hover:from-amber-500/30 dark:hover:to-orange-500/30",
    iconColor: "text-amber-600 dark:text-amber-400",
    borderColor:
      "border-amber-500/20 dark:border-amber-400/20 hover:border-amber-500/40 dark:hover:border-amber-400/40",
    activeRing: "ring-2 ring-amber-500/70 border-amber-500/50 shadow-md",
  },
  {
    id: "created",
    labelKey: "newest",
    subtitleKey: "newestSubtitle",
    icon: Sparkles,
    bgClasses:
      "bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20 hover:from-blue-500/20 hover:to-cyan-500/20 dark:hover:from-blue-500/30 dark:hover:to-cyan-500/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    borderColor:
      "border-blue-500/20 dark:border-blue-400/20 hover:border-blue-500/40 dark:hover:border-blue-400/40",
    activeRing: "ring-2 ring-blue-500/70 border-blue-500/50 shadow-md",
  },
  {
    id: "updated",
    labelKey: "updated",
    subtitleKey: "updatedSubtitle",
    icon: Clock,
    bgClasses:
      "bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20 hover:from-emerald-500/20 hover:to-teal-500/20 dark:hover:from-emerald-500/30 dark:hover:to-teal-500/30",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    borderColor:
      "border-emerald-500/20 dark:border-emerald-400/20 hover:border-emerald-500/40 dark:hover:border-emerald-400/40",
    activeRing: "ring-2 ring-emerald-500/70 border-emerald-500/50 shadow-md",
  },
  {
    id: "search",
    labelKey: "search",
    subtitleKey: "searchSubtitle",
    icon: Search,
    bgClasses:
      "bg-gradient-to-br from-violet-500/10 to-purple-500/10 dark:from-violet-500/20 dark:to-purple-500/20 hover:from-violet-500/20 hover:to-purple-500/20 dark:hover:from-violet-500/30 dark:hover:to-purple-500/30",
    iconColor: "text-violet-600 dark:text-violet-400",
    borderColor:
      "border-violet-500/20 dark:border-violet-400/20 hover:border-violet-500/40 dark:hover:border-violet-400/40",
    activeRing: "ring-2 ring-violet-500/70 border-violet-500/50 shadow-md",
  },
]

interface CommunityModeButtonsProps {
  currentMode: CommunitySortMode
  onSelectMode: (mode: CommunitySortMode) => void
}

export function CommunityModeButtons({
  currentMode,
  onSelectMode,
}: CommunityModeButtonsProps) {
  const t = useTranslations("Community.modes")

  return (
    <div className="mb-8 flex w-full justify-center sm:mb-12">
      <div className="grid w-full max-w-[650px] grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-4">
        {COMMUNITY_MODES.map((mode) => {
          const Icon = mode.icon
          const isActive = currentMode === mode.id

          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => onSelectMode(mode.id)}
              className={cn(
                "group relative flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-2xl border text-left transition-all duration-300 focus:outline-none sm:gap-3",
                "aspect-[16/11] flex-col px-3 py-3.5 hover:-translate-y-0.5 hover:shadow-lg sm:aspect-square sm:p-6",
                mode.bgClasses,
                mode.borderColor,
                isActive && cn(mode.activeRing, "scale-[1.02]")
              )}
            >
              <div
                className={cn(
                  "rounded-xl p-2 transition-transform duration-300 group-hover:scale-110 sm:p-3",
                  mode.iconColor
                )}
              >
                <Icon className="h-5 w-5 sm:h-7 sm:w-7" strokeWidth={1.75} />
              </div>
              <div className="flex h-auto items-center justify-center sm:h-10">
                <span className="text-center text-xs leading-tight font-medium sm:text-sm">
                  {t(mode.labelKey)}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
