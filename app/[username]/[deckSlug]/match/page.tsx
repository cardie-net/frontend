"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Layers, Timer, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useDeck } from "@/hooks/useDecks"
import { useCards } from "@/hooks/useCards"
import { getCardText } from "@/lib/cards"
import { shuffle } from "@/lib/utils"

type GridItem = {
  id: string
  cardId: string
  type: "front" | "back"
  content: string
  matched: boolean
}

export default function MatchPage() {
  const params = useParams<{ username: string; deckSlug: string }>()
  const username = params.username
  const deckSlug = params.deckSlug

  const { data: deck, isLoading: deckLoading } = useDeck(username, deckSlug)
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

  const endGame = useCallback(() => {
    setGameState("done")
    if (timerRef.current) clearInterval(timerRef.current)
  }, [])

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
        endGame()
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

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-5xl p-6">
        <Skeleton className="mb-6 h-10 w-32" />
        <Skeleton className="h-[60vh] w-full" />
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className="container mx-auto max-w-5xl p-6">
        <div className="mb-6">
          <Link href={`/${username}/${deckSlug}`}>
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Deck
            </Button>
          </Link>
        </div>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Card className="w-full max-w-md py-12 text-center">
            <CardContent>
              <Layers className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-2 text-xl font-semibold">No Cards Available</p>
              <p className="mb-6 text-muted-foreground">
                Add some cards to this deck to play Match Mode.
              </p>
              <Link href={`/${username}/${deckSlug}`}>
                <Button>Go Back</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-6xl p-6">
      <div className="mb-6 flex h-10 items-center justify-between">
        <Link href={`/${username}/${deckSlug}`}>
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Deck
          </Button>
        </Link>
        {(gameState === "playing" || gameState === "done") && (
          <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-1.5 font-mono text-lg text-foreground">
            <Timer className="h-4 w-4" />
            {formatTime(elapsedTime)}s
          </div>
        )}
      </div>

      <div className="flex min-h-[60vh] items-center justify-center">
        {gameState === "idle" && (
          <div className="flex flex-col items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          </div>
        )}

        {gameState === "playing" && (
          <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
            {gridItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`flex aspect-[4/3] cursor-pointer items-center justify-center rounded-xl border-2 p-4 text-center transition-all duration-200 select-none ${item.matched ? "invisible opacity-0" : "visible opacity-100"} ${selectedItemId === item.id ? "scale-[1.02] border-primary bg-primary/10" : "border-border bg-card hover:border-primary/50"} ${mismatchedIds?.includes(item.id) ? "border-destructive bg-destructive/10" : ""} `}
              >
                <div className="line-clamp-4 w-full text-sm font-medium break-words sm:text-base">
                  {item.content}
                </div>
              </div>
            ))}
          </div>
        )}

        {gameState === "done" && (
          <Card className="w-full max-w-md py-12 text-center">
            <CardHeader className="flex flex-col items-center gap-3">
              <div className="rounded-full bg-primary/10 p-4 text-primary">
                <Timer className="h-10 w-10" />
              </div>
              <CardTitle className="text-3xl font-bold">Finished!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-2 text-lg text-muted-foreground">Your time:</p>
              <p className="mb-8 font-mono text-4xl font-bold text-primary">
                {formatTime(elapsedTime)}s
              </p>
              <div className="flex flex-col gap-3">
                <Button size="lg" className="w-full" onClick={startGame}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Play Again
                </Button>
                <Link href={`/${username}/${deckSlug}`} className="w-full">
                  <Button variant="outline" size="lg" className="w-full">
                    Back to Deck
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
