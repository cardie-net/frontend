"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, LayoutGrid, Timer, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useDeck, useUpdateDeckMatchTime } from "@/hooks/useDecks"
import { useCards } from "@/hooks/useCards"
import { getCardText } from "@/lib/cards"
import { shuffle } from "@/lib/utils"
import { useActivityTracker } from "@/hooks/useActivityTracker"

type GridItem = {
  id: string
  cardId: string
  type: "front" | "back"
  content: string
  matched: boolean
}

export default function MatchPage() {
  const params = useParams<{ username: string; slug: string }>()
  const username = params.username
  const slug = params.slug

  const { trackMatchComplete } = useActivityTracker()
  const { data: deck, isLoading: deckLoading } = useDeck(username, slug)
  const { data: cards = [], isLoading: cardsLoading } = useCards(deck?.id)

  const [gameState, setGameState] = useState<"idle" | "playing" | "done">(
    "idle"
  )
  const [gridItems, setGridItems] = useState<GridItem[]>([])
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [mismatchedIds, setMismatchedIds] = useState<[string, string] | null>(
    null
  )
  const [elapsedTime, setElapsedTime] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const mismatchTimeoutRef = useRef<number | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const updateMatchTime = useUpdateDeckMatchTime()

  const startGame = useCallback(() => {
    if (!cards.length) return

    // Select up to 10 random cards
    const shuffledCards = shuffle(cards)
    const selectedCards = shuffledCards.slice(0, 10)

    // Create grid items
    const items: GridItem[] = []
    selectedCards.forEach((card) => {
      items.push({
        id: `${card.id}-front`,
        cardId: card.id,
        type: "front",
        content: getCardText(card.front),
        matched: false,
      })
      items.push({
        id: `${card.id}-back`,
        cardId: card.id,
        type: "back",
        content: getCardText(card.back),
        matched: false,
      })
    })

    // Shuffle items
    const shuffledItems = shuffle(items)

    setGridItems(shuffledItems)
    setGameState("playing")
    setSelectedItemId(null)
    setMismatchedIds(null)
    setElapsedTime(0)

    if (mismatchTimeoutRef.current) {
      window.clearTimeout(mismatchTimeoutRef.current)
      mismatchTimeoutRef.current = null
    }

    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 100)
    }, 100)
  }, [cards])

  const endGame = (finalTime: number) => {
    setGameState("done")
    trackMatchComplete()
    if (timerRef.current) clearInterval(timerRef.current)
    if (deck?.id) {
      updateMatchTime.mutate({ deckId: deck.id, timeMs: finalTime })
    }
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (mismatchTimeoutRef.current) {
        window.clearTimeout(mismatchTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (gameState === "idle" && cards.length > 0) {
      // Defer the auto-start so the effect doesn't call setState synchronously
      // (react-hooks/set-state-in-effect).
      const id = window.setTimeout(startGame, 0)
      return () => window.clearTimeout(id)
    }
  }, [gameState, cards.length, startGame])

  useEffect(() => {
    if (gameState === "playing" && scrollContainerRef.current) {
      // Use setTimeout to ensure the grid has been fully rendered and sized
      const id = window.setTimeout(() => {
        const container = scrollContainerRef.current
        if (container && container.scrollWidth > container.clientWidth) {
          container.scrollLeft =
            (container.scrollWidth - container.clientWidth) / 2
        }
      }, 0)
      return () => window.clearTimeout(id)
    }
  }, [gameState])

  const handleItemClick = (item: GridItem) => {
    if (gameState !== "playing" || item.matched || mismatchedIds) return

    if (selectedItemId === item.id) {
      setSelectedItemId(null)
      return
    }

    if (!selectedItemId) {
      setSelectedItemId(item.id)
      return
    }

    const selectedItem = gridItems.find((i) => i.id === selectedItemId)
    if (!selectedItem) return

    if (selectedItem.cardId === item.cardId) {
      // Match!
      setGridItems((prev) =>
        prev.map((i) =>
          i.cardId === item.cardId ? { ...i, matched: true } : i
        )
      )
      setSelectedItemId(null)

      const remainingUnmatched = gridItems.filter((i) => !i.matched).length
      // We just matched 2, so if remainingUnmatched was 2, we are done
      if (remainingUnmatched === 2) {
        endGame(elapsedTime)
      }
    } else {
      // Mismatch
      setMismatchedIds([selectedItemId, item.id])
      if (mismatchTimeoutRef.current) {
        window.clearTimeout(mismatchTimeoutRef.current)
      }
      mismatchTimeoutRef.current = window.setTimeout(() => {
        setMismatchedIds(null)
        setSelectedItemId(null)
        mismatchTimeoutRef.current = null
      }, 500)
    }
  }

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const m = Math.floor(totalSeconds / 60)
    const s = totalSeconds % 60
    const msStr = Math.floor((ms % 1000) / 100).toString()
    if (m > 0) return `${m}:${s.toString().padStart(2, "0")}.${msStr}`
    return `${s}.${msStr}`
  }

  const isLoading = deckLoading || cardsLoading

  return (
    <div className="container mx-auto flex h-[100dvh] max-h-[100dvh] max-w-6xl flex-col overflow-hidden px-4 pt-6 pb-16 sm:h-[calc(100dvh-64px)] sm:max-h-none sm:px-10 sm:py-12 sm:pb-8">
      <div className="flex shrink-0 flex-col">
        <div className="flex items-center justify-start gap-4 sm:justify-between">
          <div className="hidden items-center gap-3 sm:flex">
            <div className="flex shrink-0 items-center justify-center rounded-2xl bg-primary/10 p-2.5 text-primary shadow-sm">
              <LayoutGrid className="h-6 w-6" />
            </div>
            <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
              Match
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:hidden">
            <Link href={`/${username}/${slug}`}>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-xl font-medium"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            {(gameState === "playing" || gameState === "done") && (
              <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-1.5 font-mono text-sm text-foreground">
                <Timer className="h-4 w-4" />
                {formatTime(elapsedTime)}s
              </div>
            )}
          </div>

          <div className="hidden items-center justify-end gap-2 sm:flex">
            {(gameState === "playing" || gameState === "done") && (
              <div className="mr-2 flex items-center gap-2 rounded-md bg-muted/50 px-3 py-1.5 font-mono text-lg text-foreground">
                <Timer className="h-4 w-4" />
                {formatTime(elapsedTime)}s
              </div>
            )}
            <Link href={`/${username}/${slug}`}>
              <Button
                variant="outline"
                className="gap-2 rounded-xl font-medium"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Deck
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-2 flex min-h-0 w-full flex-1 flex-col items-center justify-center sm:mt-8">
        {isLoading ? (
          <div className="flex w-full flex-1 flex-col items-center justify-center space-y-4">
            <Skeleton className="h-[400px] w-full max-w-2xl rounded-xl" />
          </div>
        ) : (
          <div className="flex h-full min-h-0 w-full flex-1 flex-col items-center justify-center">
            {gameState === "idle" && (
              <div className="flex flex-col items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
              </div>
            )}

            {gameState === "playing" && (
              <div
                ref={scrollContainerRef}
                className="flex h-full min-h-0 w-full max-w-full items-center justify-start overflow-x-auto overflow-y-hidden scroll-smooth px-1 pb-1 sm:justify-center"
              >
                <div
                  className="grid h-full max-h-[580px] w-full min-w-[560px] grid-cols-4 grid-rows-[repeat(var(--mobile-rows),minmax(0,1fr))] gap-2.5 sm:h-auto sm:max-h-none sm:min-w-0 sm:grid-cols-3 sm:grid-rows-none sm:gap-4 md:grid-cols-4 lg:grid-cols-5"
                  style={
                    {
                      "--mobile-rows": Math.max(
                        1,
                        Math.ceil(gridItems.length / 4)
                      ),
                    } as React.CSSProperties
                  }
                >
                  {gridItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className={`flex h-full min-h-0 cursor-pointer items-center justify-center rounded-xl border-2 p-2.5 text-center transition-all duration-200 select-none sm:aspect-[4/3] sm:h-auto sm:p-4 ${item.matched ? "invisible opacity-0" : "visible opacity-100"} ${selectedItemId === item.id ? "scale-[1.02] border-primary bg-primary/10" : "border-border bg-card hover:border-primary/50"} ${mismatchedIds?.includes(item.id) ? "border-destructive bg-destructive/10" : ""} `}
                    >
                      <div className="line-clamp-3 w-full text-xs font-medium break-words sm:line-clamp-4 sm:text-base">
                        {item.content}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {gameState === "done" && (
              <Card className="w-full max-w-md py-12 text-center">
                <CardHeader className="flex flex-col items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-4 text-primary">
                    <Timer className="h-10 w-10" />
                  </div>
                  <CardTitle className="text-3xl font-bold">
                    Finished!
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-2 text-lg text-muted-foreground">
                    Your time:
                  </p>
                  <p className="mb-8 font-mono text-4xl font-bold text-primary">
                    {formatTime(elapsedTime)}s
                  </p>
                  <div className="flex flex-col gap-3">
                    <Button size="lg" className="w-full" onClick={startGame}>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Play Again
                    </Button>
                    <Link href={`/${username}/${slug}`} className="w-full">
                      <Button variant="outline" size="lg" className="w-full">
                        Back to Deck
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
