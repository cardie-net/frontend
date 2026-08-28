import { useState, useEffect, useCallback, useRef } from "react"
import {
  FlashCard,
  SRSCardProgress,
  SRSReviewItem,
  SRSStudyResponse,
} from "@/types"
import { apiFetch } from "@/lib/api"
import { useFlushOnUnload } from "@/hooks/useFlushOnUnload"
import { useActivityTracker } from "@/hooks/useActivityTracker"

const BATCH_SIZE = 5

type SessionQueueItem = {
  card: FlashCard
  srs: SRSCardProgress
  type: "new" | "learning" | "review"
}

// Pure function for preview intervals
export function computePreviewIntervals(
  reps: number,
  interval: number,
  ef: number
) {
  const calcInterval = (rating: number) => {
    // "Again" keeps the card in today's learning queue (~10 min step),
    // mirroring LEARNING_STEP_DAYS in the backend scheduler.
    if (rating === 0) return 10 / (24 * 60)
    if (rating === 1) return Math.max(1.0, interval * 1.2)
    if (rating === 2) {
      if (reps === 0) return 1.0
      if (reps === 1) return 6.0
      return interval * ef
    }
    if (rating === 3) {
      if (reps === 0) return 4.0
      if (reps === 1) return 10.0
      return interval * ef * 1.3
    }
    return 1.0
  }

  const formatInt = (days: number) => {
    if (days < 0.042) {
      const mins = Math.max(1, Math.round(days * 24 * 60))
      return `<${mins}m`
    }
    if (days < 1) {
      const hrs = Math.max(1, Math.round(days * 24))
      return `${hrs}h`
    }
    if (days < 30) {
      return `${Math.round(days)}d`
    }
    return `${Math.round(days / 30)}mo`
  }

  return {
    again: formatInt(calcInterval(0)),
    hard: formatInt(calcInterval(1)),
    good: formatInt(calcInterval(2)),
    easy: formatInt(calcInterval(3)),
  }
}

export function useSRSSession(deckId: string) {
  const { trackSRSReview } = useActivityTracker()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [queue, setQueue] = useState<SessionQueueItem[]>([])
  const [relearnQueue, setRelearnQueue] = useState<SessionQueueItem[]>([])

  const [counts, setCounts] = useState({
    newRemaining: 0,
    learningRemaining: 0,
    reviewRemaining: 0,
  })
  const [isFlipped, setIsFlipped] = useState(false)

  const updateQueueRef = useRef<SRSReviewItem[]>([])

  const syncProgress = useCallback(
    async (updates: SRSReviewItem[], isUnload: boolean = false) => {
      if (updates.length === 0) return
      try {
        await apiFetch(`/api/v1/decks/${deckId}/srs/review`, {
          method: "POST",
          body: JSON.stringify({ reviews: updates }),
          keepalive: isUnload,
        })
      } catch (err) {
        console.error("Failed to sync progress:", err)
      }
    },
    [deckId]
  )

  // Sync on unmount or tab close
  const flushPendingUpdates = useCallback(() => {
    if (updateQueueRef.current.length > 0) {
      syncProgress([...updateQueueRef.current], true)
      updateQueueRef.current = []
    }
  }, [syncProgress])

  useFlushOnUnload(flushPendingUpdates)

  const fetchSessionData = useCallback(async () => {
    if (!deckId) return
    setLoading(true)
    setError(null)
    try {
      const [cardsRes, srsRes] = await Promise.all([
        apiFetch(`/api/v1/decks/${deckId}/cards`),
        apiFetch(`/api/v1/decks/${deckId}/srs/study`),
      ])

      if (!cardsRes.ok) throw new Error("Failed to fetch cards")
      if (!srsRes.ok) throw new Error("Failed to fetch SRS data")

      const cardsData: FlashCard[] = await cardsRes.json()
      const srsData: SRSStudyResponse = await srsRes.json()

      const cardsMap = new Map(cardsData.map((c) => [c.id, c]))

      const learning = srsData.learning_cards
        .map((s) => ({
          card: cardsMap.get(s.card_id)!,
          srs: s,
          type: "learning" as const,
        }))
        .filter((x) => x.card)
      const news = srsData.new_cards
        .map((s) => ({
          card: cardsMap.get(s.card_id)!,
          srs: s,
          type: "new" as const,
        }))
        .filter((x) => x.card)
      const reviews = srsData.review_cards
        .map((s) => ({
          card: cardsMap.get(s.card_id)!,
          srs: s,
          type: "review" as const,
        }))
        .filter((x) => x.card)

      setCounts({
        newRemaining: news.length,
        learningRemaining: learning.length,
        reviewRemaining: reviews.length,
      })

      const initialQueue = [...learning, ...news, ...reviews]
      if (initialQueue.length > 0) {
        setQueue(initialQueue)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [deckId])

  useEffect(() => {
    // Defer so the effect never calls setState synchronously (react-hooks/set-state-in-effect).
    void Promise.resolve().then(fetchSessionData)
  }, [fetchSessionData])

  // The active item is the first in queue, or if queue empty, first in relearnQueue
  const currentItem =
    queue.length > 0
      ? queue[0]
      : relearnQueue.length > 0
        ? relearnQueue[0]
        : null

  const handleRating = (rating: number) => {
    if (!currentItem) return

    trackSRSReview()

    // Update remote
    updateQueueRef.current.push({ card_id: currentItem.card.id, rating })

    if (updateQueueRef.current.length >= BATCH_SIZE) {
      // keepalive so the batch survives tab close / navigation
      syncProgress([...updateQueueRef.current], true)
      updateQueueRef.current = []
    }

    // The badge counts track the main queue: any card leaving it (rated again
    // or passed) decrements its type's count. Relearned cards are counted via
    // relearnQueue.length in totalRemaining instead.
    if (queue.length > 0) {
      setCounts((prev) => {
        const { newRemaining, learningRemaining, reviewRemaining } = prev
        if (currentItem.type === "learning" && learningRemaining > 0)
          return { ...prev, learningRemaining: learningRemaining - 1 }
        if (currentItem.type === "new" && newRemaining > 0)
          return { ...prev, newRemaining: newRemaining - 1 }
        if (currentItem.type === "review" && reviewRemaining > 0)
          return { ...prev, reviewRemaining: reviewRemaining - 1 }
        return prev
      })
    }

    // Compute the next queues from the current state
    let nextQueue = queue
    let nextRelearn = relearnQueue
    if (rating === 0) {
      // Re-insert into relearnQueue 3-5 slots ahead or end
      const insertIdx = Math.min(
        relearnQueue.length,
        3 + Math.floor(Math.random() * 2)
      )
      nextRelearn = [...relearnQueue]

      // If we popped from main queue, we need to add to relearn.
      if (queue.length > 0) {
        nextRelearn.splice(insertIdx, 0, currentItem)
        nextQueue = queue.slice(1)
      } else {
        // Popped from relearn queue itself
        const popped = nextRelearn.shift()
        if (popped) {
          nextRelearn.splice(Math.min(nextRelearn.length, insertIdx), 0, popped)
        }
      }
    } else {
      if (queue.length > 0) {
        nextQueue = queue.slice(1)
      } else {
        nextRelearn = relearnQueue.slice(1)
      }
    }

    setQueue(nextQueue)
    setRelearnQueue(nextRelearn)
    setIsFlipped(false)

    // Session is over — flush any remaining updates (keepalive so they survive navigation).
    if (
      nextQueue.length === 0 &&
      nextRelearn.length === 0 &&
      updateQueueRef.current.length > 0
    ) {
      syncProgress([...updateQueueRef.current], true)
      updateQueueRef.current = []
    }
  }

  // Session is complete when there is nothing left to review.
  const sessionCompleted =
    !loading && queue.length === 0 && relearnQueue.length === 0

  const previewIntervals = currentItem
    ? computePreviewIntervals(
        currentItem.srs.repetitions,
        currentItem.srs.interval,
        currentItem.srs.ease_factor
      )
    : { again: "", hard: "", good: "", easy: "" }

  return {
    loading,
    error,
    sessionCompleted,
    currentCard: currentItem?.card || null,
    currentSRS: currentItem?.srs || null,
    isFlipped,
    setIsFlipped,
    handleRating,
    previewIntervals,
    counts,
    totalRemaining:
      counts.newRemaining +
      counts.learningRemaining +
      counts.reviewRemaining +
      relearnQueue.length,
  }
}
