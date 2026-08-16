"use client"

import React, { useMemo, useState, useEffect, useRef } from "react"
import { useTranslations, useLocale } from "next-intl"
import { UserActivitySummary, UserDailyActivity } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Flame, Trophy, Zap, Calendar, Activity } from "lucide-react"

interface ActivityGraphProps {
  summary?: UserActivitySummary
  isLoading?: boolean
}

type DayCell = {
  dateStr: string // YYYY-MM-DD
  dateObj: Date
  activity?: UserDailyActivity
  points: number
  level: 0 | 1 | 2 | 3 | 4
}

export function ActivityGraph({ summary, isLoading }: ActivityGraphProps) {
  const t = useTranslations("Stats")
  const tCommon = useTranslations("Common")
  const locale = useLocale()

  const [hoveredCell, setHoveredCell] = useState<DayCell | null>(null)
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Generate 52 weeks (364/365 days) grid data ending today
  const { weeks, monthLabels, dayLabels } = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Find the end of the current week (Saturday or Sunday, let's use Saturday to match GitHub)
    const dayOfWeek = today.getDay() // 0 = Sun, 6 = Sat
    const gridEnd = new Date(today)
    gridEnd.setDate(today.getDate() + (6 - dayOfWeek))

    // Start 52 weeks prior
    const gridStart = new Date(gridEnd)
    gridStart.setDate(gridEnd.getDate() - 52 * 7 + 1)

    const actMap = new Map<string, UserDailyActivity>()
    if (summary?.activities) {
      summary.activities.forEach((act) => {
        actMap.set(act.date, act)
      })
    }

    const weeksList: DayCell[][] = []
    const mLabels: { name: string; weekIndex: number }[] = []

    let currentWeek: DayCell[] = []
    let lastMonth = -1

    const iterDate = new Date(gridStart)
    let weekIdx = 0

    while (iterDate <= gridEnd) {
      const year = iterDate.getFullYear()
      const month = String(iterDate.getMonth() + 1).padStart(2, "0")
      const day = String(iterDate.getDate()).padStart(2, "0")
      const dateStr = `${year}-${month}-${day}`

      const act = actMap.get(dateStr)
      const points = act?.points || 0

      let level: 0 | 1 | 2 | 3 | 4 = 0
      if (points > 30) level = 4
      else if (points > 15) level = 3
      else if (points > 5) level = 2
      else if (points > 0) level = 1

      currentWeek.push({
        dateStr,
        dateObj: new Date(iterDate),
        activity: act,
        points,
        level,
      })

      // Track month labels when a month changes on Sunday/Monday (first day of column)
      if (currentWeek.length === 1) {
        const m = iterDate.getMonth()
        if (m !== lastMonth) {
          const monthName = iterDate.toLocaleString(locale, { month: "short" })
          mLabels.push({ name: monthName, weekIndex: weekIdx })
          lastMonth = m
        }
      }

      if (currentWeek.length === 7) {
        weeksList.push(currentWeek)
        currentWeek = []
        weekIdx++
      }

      iterDate.setDate(iterDate.getDate() + 1)
    }

    if (currentWeek.length > 0) {
      weeksList.push(currentWeek)
    }

    // Omit month labels near the right edge (fewer than 2 weeks remaining)
    const filteredMonthLabels = mLabels.filter(
      (lbl) => lbl.weekIndex < weeksList.length - 2
    )

    // Dynamic weekday names (Mon, Wed, Fri)
    const monDate = new Date(2026, 0, 5) // Monday
    const wedDate = new Date(2026, 0, 7) // Wednesday
    const friDate = new Date(2026, 0, 9) // Friday
    const dLabels = {
      mon: monDate.toLocaleString(locale, { weekday: "short" }),
      wed: wedDate.toLocaleString(locale, { weekday: "short" }),
      fri: friDate.toLocaleString(locale, { weekday: "short" }),
    }

    return { weeks: weeksList, monthLabels: filteredMonthLabels, dayLabels: dLabels }
  }, [summary, locale])

  // Scroll to the right-most side by default (so today/recent days are in view)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth
    }
  }, [summary, weeks])


  const getLevelColor = (level: 0 | 1 | 2 | 3 | 4) => {
    switch (level) {
      case 1:
        return "bg-emerald-200 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-900"
      case 2:
        return "bg-emerald-400 dark:bg-emerald-700 border-emerald-500 dark:border-emerald-600"
      case 3:
        return "bg-emerald-500 dark:bg-emerald-500 border-emerald-600 dark:border-emerald-400"
      case 4:
        return "bg-emerald-700 dark:bg-emerald-300 border-emerald-800 dark:border-emerald-200"
      case 0:
      default:
        return "bg-muted/50 border-border/40 hover:border-border"
    }
  }

  const handleMouseEnter = (cell: DayCell, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setHoveredCell(cell)
    setTooltipPos({
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
    })
  }

  const handleMouseLeave = () => {
    setHoveredCell(null)
    setTooltipPos(null)
  }

  if (isLoading) {
    return (
      <Card className="rounded-3xl border-border/80 shadow-sm overflow-hidden bg-card p-5 sm:p-6 animate-pulse space-y-4">
        <div className="h-6 w-48 bg-muted rounded-lg" />
        <div className="h-36 w-full bg-muted/50 rounded-2xl" />
      </Card>
    )
  }

  return (
    <Card className="rounded-3xl border-border/80 shadow-sm overflow-hidden bg-card p-5 sm:p-6 flex flex-col gap-4 sm:gap-5">
      <CardHeader className="p-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2.5 text-xl font-bold tracking-tight">
              <Activity className="h-5 w-5 text-primary" />
              <span className="sm:hidden">{t("activityTitle")}</span>
              <span className="hidden sm:inline">{t("activityTitleLong")}</span>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-1">
              {t("activityDesc")}
            </CardDescription>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <span>{t("less")}</span>
            <div className="flex gap-1 items-center">
              <div className="h-3 w-3 rounded-xs bg-muted/50 border border-border/40" />
              <div className="h-3 w-3 rounded-xs bg-emerald-200 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-900" />
              <div className="h-3 w-3 rounded-xs bg-emerald-400 dark:bg-emerald-700 border border-emerald-500 dark:border-emerald-600" />
              <div className="h-3 w-3 rounded-xs bg-emerald-500 dark:bg-emerald-500 border border-emerald-600 dark:border-emerald-400" />
              <div className="h-3 w-3 rounded-xs bg-emerald-700 dark:bg-emerald-300 border border-emerald-800 dark:border-emerald-200" />
            </div>
            <span>{t("more")}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 relative">
        <div className="flex flex-col gap-4 sm:gap-5">
          {/* Streak & Metric Badges Grid (1 column on mobile, 2x2 on desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/30 p-3.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 dark:bg-amber-500/20 shrink-0">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <div className="text-lg font-bold tracking-tight">{summary?.current_streak || 0} {tCommon("days")}</div>
                <div className="text-[11px] font-medium text-muted-foreground">{t("currentStreak")}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/30 p-3.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500 dark:bg-purple-500/20 shrink-0">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <div className="text-lg font-bold tracking-tight">{summary?.longest_streak || 0} {tCommon("days")}</div>
                <div className="text-[11px] font-medium text-muted-foreground">{t("longestStreak")}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/30 p-3.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 shrink-0">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <div className="text-lg font-bold tracking-tight">{summary?.total_points || 0}</div>
                <div className="text-[11px] font-medium text-muted-foreground">{t("totalPoints")}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/30 p-3.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 dark:bg-blue-500/20 shrink-0">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <div className="text-lg font-bold tracking-tight">{summary?.total_active_days || 0}</div>
                <div className="text-[11px] font-medium text-muted-foreground">{t("activeDays")}</div>
              </div>
            </div>
          </div>

          {/* Mobile Legend (Displayed under streak/points blocks on mobile) */}
          <div className="flex sm:hidden items-center justify-end gap-2 text-xs text-muted-foreground">
            <span>{t("less")}</span>
            <div className="flex gap-1 items-center">
              <div className="h-3 w-3 rounded-xs bg-muted/50 border border-border/40" />
              <div className="h-3 w-3 rounded-xs bg-emerald-200 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-900" />
              <div className="h-3 w-3 rounded-xs bg-emerald-400 dark:bg-emerald-700 border border-emerald-500 dark:border-emerald-600" />
              <div className="h-3 w-3 rounded-xs bg-emerald-500 dark:bg-emerald-500 border border-emerald-600 dark:border-emerald-400" />
              <div className="h-3 w-3 rounded-xs bg-emerald-700 dark:bg-emerald-300 border border-emerald-800 dark:border-emerald-200" />
            </div>
            <span>{t("more")}</span>
          </div>

          {/* Heatmap Grid Container */}
          <div ref={scrollRef} className="relative overflow-x-auto pb-2 scrollbar-thin">
            <div className="min-w-[780px]">
              {/* Month Labels Header */}
              <div className="relative h-4 text-[11px] text-muted-foreground mb-2 pl-7 font-medium">
                {monthLabels.map((lbl, idx) => (
                  <div
                    key={idx}
                    className="absolute top-0 capitalize"
                    style={{
                      left: `${lbl.weekIndex * 15 + 28}px`,
                    }}
                  >
                    {lbl.name}
                  </div>
                ))}
              </div>

              <div className="flex pt-1">
                {/* Day of Week Labels (Sticky on the left) */}
                <div className="sticky left-0 z-20 bg-card grid grid-rows-7 gap-[3px] pr-2 text-[10px] font-medium text-muted-foreground leading-[12px] shrink-0">
                  <span className="h-3"></span>
                  <span className="h-3 flex items-center capitalize">{dayLabels.mon}</span>
                  <span className="h-3"></span>
                  <span className="h-3 flex items-center capitalize">{dayLabels.wed}</span>
                  <span className="h-3"></span>
                  <span className="h-3 flex items-center capitalize">{dayLabels.fri}</span>
                  <span className="h-3"></span>
                </div>

                {/* Weeks & Cells */}
                <div className="flex gap-[3px] flex-1">
                  {weeks.map((week, wIdx) => (
                    <div key={wIdx} className="grid grid-rows-7 gap-[3px]">
                      {week.map((cell) => (
                        <div
                          key={cell.dateStr}
                          onMouseEnter={(e) => handleMouseEnter(cell, e)}
                          onMouseLeave={handleMouseLeave}
                          className={`h-3 w-3 rounded-[3px] border transition-transform duration-100 hover:scale-125 hover:z-10 cursor-pointer ${getLevelColor(
                            cell.level
                          )}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Custom Tooltip (Outside gap-6 flex flow) */}
        {hoveredCell && tooltipPos && (
          <div
            className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full px-3 py-2 rounded-xl bg-popover text-popover-foreground text-xs shadow-md border border-border/80 whitespace-nowrap animate-in fade-in-0 zoom-in-95 duration-100"
            style={{
              left: `${tooltipPos.x}px`,
              top: `${tooltipPos.y}px`,
            }}
          >
            <div className="font-semibold text-foreground">
              {hoveredCell.points > 0 ? `${hoveredCell.points} ${tCommon("points")}` : t("noActivity")}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5 capitalize">
              {hoveredCell.dateObj.toLocaleDateString(locale, {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
            {hoveredCell.activity?.details && Object.keys(hoveredCell.activity.details).length > 0 && (
              <div className="mt-1.5 pt-1.5 border-t border-border/50 flex gap-2 text-[10px] font-medium text-muted-foreground">
                {Object.entries(hoveredCell.activity.details).map(([type, pts]) => (
                  <span key={type} className="capitalize">
                    {type}: +{pts}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
