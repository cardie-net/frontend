"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useDeck } from "@/hooks/useDecks"
import { useSRSSession } from "@/hooks/useSRSSession"
import { FlipCard } from "@/components/FlipCard"
import { CardElement } from "@/types"

export default function SpacedRepetitionPage() {
  const params = useParams<{ username: string; deckSlug: string }>()
  const username = params.username
  const deckSlug = params.deckSlug

  const { data: deck, isLoading: deckLoading } = useDeck(username, deckSlug)

  const {
    loading: sessionLoading,
    error,
    sessionCompleted,
    currentCard,
    isFlipped,
    setIsFlipped,
    handleRating,
    previewIntervals,
    counts,
    totalRemaining,
  } = useSRSSession(deck?.id || "")

  const [backContent, setBackContent] = useState<CardElement[] | null>(null)

  const isLoading = deckLoading || (!!deck && sessionLoading)

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-64px)] max-w-4xl flex-col p-6">
      <div className="mb-8 flex items-center gap-4">
        <Link href={`/${username}/${deckSlug}`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Deck
          </Button>
        </Link>
        <div className="flex flex-1 justify-center gap-2">
          {counts.newRemaining > 0 && (
            <Badge className="bg-blue-500 px-3 py-1 text-white hover:bg-blue-600">
              {counts.newRemaining} New
            </Badge>
          )}
          {counts.learningRemaining > 0 && (
            <Badge className="bg-orange-500 px-3 py-1 text-white hover:bg-orange-600">
              {counts.learningRemaining} Learning
            </Badge>
          )}
          {counts.reviewRemaining > 0 && (
            <Badge className="bg-green-500 px-3 py-1 text-white hover:bg-green-600">
              {counts.reviewRemaining} Review
            </Badge>
          )}
        </div>
        <div className="min-w-[80px] text-right text-sm font-medium whitespace-nowrap text-muted-foreground">
          {totalRemaining} Total
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-1 flex-col items-center justify-center space-y-4">
          <Skeleton className="h-[400px] w-full max-w-2xl rounded-xl" />
        </div>
      ) : error ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="mb-4 text-destructive">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      ) : sessionCompleted ? (
        <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center text-center">
          <div className="mb-6 rounded-full bg-primary/10 p-6">
            <Check className="h-12 w-12 text-primary" />
          </div>
          <h2 className="mb-2 text-2xl font-bold">Session Complete!</h2>
          <p className="mb-8 text-muted-foreground">
            You have reviewed all cards due for today. Great job!
          </p>
          <Link href={`/${username}/${deckSlug}`} className="w-full">
            <Button size="lg" className="w-full" variant="outline">
              Return to Deck
            </Button>
          </Link>
        </div>
      ) : currentCard ? (
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center">
          <FlipCard
            front={currentCard.front}
            back={currentCard.back}
            flipped={isFlipped}
            backContent={backContent}
            onFlip={() => {
              setBackContent(currentCard.back)
              setIsFlipped(true)
            }}
          />

          <div
            className={`mt-8 flex w-full gap-3 transition-opacity duration-300 ${isFlipped ? "opacity-100" : "pointer-events-none opacity-0"}`}
          >
            <Button
              size="lg"
              variant="destructive"
              className="h-auto flex-1 flex-col gap-1 py-3"
              onClick={() => handleRating(0)}
            >
              <span className="text-base font-semibold">Again</span>
              <span className="text-xs opacity-90">
                {previewIntervals.again}
              </span>
            </Button>

            <Button
              size="lg"
              className="h-auto flex-1 flex-col gap-1 bg-orange-500 py-3 text-white hover:bg-orange-600"
              onClick={() => handleRating(1)}
            >
              <span className="text-base font-semibold">Hard</span>
              <span className="text-xs opacity-90">
                {previewIntervals.hard}
              </span>
            </Button>

            <Button
              size="lg"
              className="h-auto flex-1 flex-col gap-1 bg-blue-500 py-3 text-white hover:bg-blue-600"
              onClick={() => handleRating(2)}
            >
              <span className="text-base font-semibold">Good</span>
              <span className="text-xs opacity-90">
                {previewIntervals.good}
              </span>
            </Button>

            <Button
              size="lg"
              className="h-auto flex-1 flex-col gap-1 bg-green-500 py-3 text-white hover:bg-green-600"
              onClick={() => handleRating(3)}
            >
              <span className="text-base font-semibold">Easy</span>
              <span className="text-xs opacity-90">
                {previewIntervals.easy}
              </span>
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
