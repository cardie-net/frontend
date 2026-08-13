import { useRef, useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api"
import { useAuth } from "@/lib/AuthContext"
import { queryKeys } from "@/lib/queryKeys"
import { useFlushOnUnload } from "@/hooks/useFlushOnUnload"

// Point values per study mode action
export const POINT_WEIGHTS = {
  overview: 1,
  learn: 4,
  srs: 3,
  match: 10,
  exam: 15,
} as const

export type ActivityType = keyof typeof POINT_WEIGHTS

interface PendingActivity {
  points: number
  count: number
  details: Record<string, number>
}

export function useActivityTracker() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const pendingRef = useRef<PendingActivity>({
    points: 0,
    count: 0,
    details: {},
  })
  const timerRef = useRef<number | null>(null)

  const isEligible = !!user && !user.is_guest

  const flush = useCallback(async () => {
    if (!isEligible) return
    const pending = pendingRef.current
    if (pending.points <= 0) return

    const pointsToSend = pending.points
    const countToSend = pending.count
    const detailsToSend = { ...pending.details }

    // Clear pending state immediately before network call to prevent duplicate sends
    pendingRef.current = { points: 0, count: 0, details: {} }

    try {
      // Send separate requests per activity_type in details if multiple exist, or batch
      for (const [type, pts] of Object.entries(detailsToSend)) {
        if (pts <= 0) continue
        await apiFetch("/api/v1/users/me/activity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            points: pts,
            count: Math.max(1, Math.round((pts / (POINT_WEIGHTS[type as ActivityType] || 1)))),
            activity_type: type,
          }),
        })
      }

      // Invalidate user activity query in cache so statistics reflect newly logged points
      queryClient.invalidateQueries({
        queryKey: queryKeys.userActivity(user?.id),
      })
    } catch (err) {
      console.error("Failed to sync activity points:", err)
      // On error, restore unsent points to pending accumulator
      pendingRef.current.points += pointsToSend
      pendingRef.current.count += countToSend
      for (const [k, v] of Object.entries(detailsToSend)) {
        pendingRef.current.details[k] = (pendingRef.current.details[k] || 0) + v
      }
    }
  }, [isEligible, user, queryClient])

  useFlushOnUnload(flush)

  const addPoints = useCallback(
    (points: number, activityType: ActivityType, count: number = 1) => {
      if (!isEligible || points <= 0) return

      pendingRef.current.points += points
      pendingRef.current.count += count
      pendingRef.current.details[activityType] =
        (pendingRef.current.details[activityType] || 0) + points

      // Reset debounce timer for 3 seconds
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
      }
      timerRef.current = window.setTimeout(() => {
        flush()
      }, 3000)
    },
    [isEligible, flush]
  )

  const trackOverviewCard = useCallback(
    (count: number = 1) => {
      addPoints(POINT_WEIGHTS.overview * count, "overview", count)
    },
    [addPoints]
  )

  const trackLearnSwipe = useCallback(
    (count: number = 1) => {
      addPoints(POINT_WEIGHTS.learn * count, "learn", count)
    },
    [addPoints]
  )

  const trackSRSReview = useCallback(
    (count: number = 1) => {
      addPoints(POINT_WEIGHTS.srs * count, "srs", count)
    },
    [addPoints]
  )

  const trackMatchComplete = useCallback(() => {
    addPoints(POINT_WEIGHTS.match, "match", 1)
  }, [addPoints])

  const trackExamSubmit = useCallback(() => {
    addPoints(POINT_WEIGHTS.exam, "exam", 1)
  }, [addPoints])

  return {
    addPoints,
    trackOverviewCard,
    trackLearnSwipe,
    trackSRSReview,
    trackMatchComplete,
    trackExamSubmit,
    flush,
  }
}
