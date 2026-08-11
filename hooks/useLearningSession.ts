import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { FlashCard, CardProgress } from "@/types"
import { apiFetch } from "@/lib/api"
import { shuffle } from "@/lib/utils"
import { useFlushOnUnload } from "@/hooks/useFlushOnUnload"
import { useActivityTracker } from "@/hooks/useActivityTracker"


const BATCH_SIZE = 5

export function useLearningSession(deckId: string) {
  const { trackLearnSwipe } = useActivityTracker()
  const [cards, setCards] = useState<FlashCard[]>([])
  const [progressMap, setProgressMap] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // The queue of progress updates to sync
  const updateQueueRef = useRef<CardProgress[]>([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [sessionCards, setSessionCards] = useState<FlashCard[]>([])
  const [sessionCompleted, setSessionCompleted] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)


  const fetchSessionData = useCallback(async () => {
    if (!deckId) return

    setLoading(true)
    setError(null)
    try {
      // Fetch cards and progress in parallel
      const [cardsRes, progressRes] = await Promise.all([
        apiFetch(`/api/v1/decks/${deckId}/cards`),
        apiFetch(`/api/v1/decks/${deckId}/progress`),
      ])
      if (!cardsRes.ok) throw new Error("Failed to fetch cards")
      if (!progressRes.ok) throw new Error("Failed to fetch progress")

      const [cardsData, progressData] = await Promise.all([
        cardsRes.json() as Promise<FlashCard[]>,
        progressRes.json() as Promise<CardProgress[]>,
      ])

      const pMap: Record<string, number> = {}
      for (const p of progressData) {
        pMap[p.card_id] = p.box
      }
      setProgressMap(pMap)
      setCards(cardsData)

      // Filter out Box 3 (mastered) cards
      const availableCards = cardsData.filter(
        (card) => (pMap[card.id] || 1) < 3
      )

      if (availableCards.length === 0) {
        setSessionCompleted(true)
      } else {
        setSessionCompleted(false)
        // Shuffle available cards
        const shuffled = shuffle(availableCards)
        setSessionCards(shuffled)
        setCurrentCardIndex(0)
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

  const syncProgress = useCallback(
    async (updates: CardProgress[], isUnload: boolean = false) => {
      if (updates.length === 0) return

      // Deduplicate updates: only keep the latest update for each card
      const latestUpdatesMap = new Map<string, CardProgress>()
      for (const update of updates) {
        latestUpdatesMap.set(update.card_id, update)
      }
      const deduplicatedUpdates = Array.from(latestUpdatesMap.values())

      try {
        await apiFetch(`/api/v1/decks/${deckId}/progress`, {
          method: "POST",
          body: JSON.stringify({ progress: deduplicatedUpdates }),
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
      updateQueueRef.current = [] // Clear to prevent double sync
    }
  }, [syncProgress])

  useFlushOnUnload(flushPendingUpdates)

  const handleAnswer = (knewIt: boolean) => {
    if (!sessionCards[currentCardIndex]) return

    // Track activity points for swiping/answering card
    trackLearnSwipe()

    const cardId = sessionCards[currentCardIndex].id
    const currentBox = progressMap[cardId] || 1
    let nextBox = knewIt ? currentBox + 1 : 1

    if (nextBox > 3) nextBox = 3

    // Update local state
    setProgressMap((prev) => ({ ...prev, [cardId]: nextBox }))

    // Add to sync queue
    updateQueueRef.current.push({ card_id: cardId, box: nextBox })

    // Flush if needed (keepalive so the batch survives tab close / navigation)
    if (updateQueueRef.current.length >= BATCH_SIZE) {
      syncProgress([...updateQueueRef.current], true)
      updateQueueRef.current = []
    }

    // Move to next card
    if (currentCardIndex + 1 < sessionCards.length) {
      setIsFlipped(false)
      setCurrentCardIndex((prev) => prev + 1)
    } else {
      // Re-evaluate session cards based on new progress
      const remainingCards = sessionCards.filter((c) => {
        const box = progressMap[c.id] || 1
        // if this card was just answered, we need to use its nextBox
        const actualBox = c.id === cardId ? nextBox : box
        return actualBox < 3
      })

      if (remainingCards.length === 0) {
        setSessionCompleted(true)
        // Instantly flush queue since the session is done, use keepalive=true so it survives quick navigation
        if (updateQueueRef.current.length > 0) {
          syncProgress([...updateQueueRef.current], true)
          updateQueueRef.current = []
        }
      } else {
        const shuffled = shuffle(remainingCards)
        setSessionCards(shuffled)
        setCurrentCardIndex(0)
        setIsFlipped(false)
      }
    }
  }

  const stats = useMemo(() => {
    let box1 = 0
    let box2 = 0
    let box3 = 0

    cards.forEach((card) => {
      const box = progressMap[card.id] || 1
      if (box === 1) box1++
      else if (box === 2) box2++
      else if (box === 3) box3++
    })

    return { box1, box2, box3, total: cards.length }
  }, [cards, progressMap])

  const resetProgress = useCallback(
    async (targetBox: number) => {
      if (!deckId || cards.length === 0) return
      setLoading(true)
      try {
        const updates = cards.map((c) => ({ card_id: c.id, box: targetBox }))
        await syncProgress(updates)
        updateQueueRef.current = []
        await fetchSessionData()
      } catch (err) {
        console.error("Failed to reset progress:", err)
        setLoading(false)
      }
    },
    [deckId, cards, syncProgress, fetchSessionData]
  )

  const restartLearning = useCallback(() => resetProgress(2), [resetProgress])
  const clearProgress = useCallback(() => resetProgress(1), [resetProgress])

  return {
    loading,
    error,
    sessionCompleted,
    currentCard: sessionCards[currentCardIndex],
    isFlipped,
    setIsFlipped,
    handleAnswer,
    restartLearning,
    clearProgress,
    stats,
  }
}
