"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Check, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useDeck } from "@/hooks/useDecks"
import { useSRSSession } from "@/hooks/useSRSSession"
import { FlipCard } from "@/components/FlipCard"
import { CardElement } from "@/types"

export default function SpacedRepetitionPage() {
  const params = useParams<{ username: string; slug: string }>()
  const username = params.username
  const slug = params.slug

  const { data: deck, isLoading: deckLoading } = useDeck(username, slug)

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
    <div className="container mx-auto flex h-[calc(100dvh-64px)] overflow-hidden max-w-4xl flex-col space-y-4 sm:space-y-8 px-4 pt-8 pb-2 sm:px-10 sm:py-16">
      <div className="flex flex-col">
        <div className="flex justify-start sm:justify-between gap-4 items-center">
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex shrink-0 items-center justify-center rounded-2xl bg-primary/10 p-2.5 text-primary shadow-sm">
              <Clock className="h-6 w-6" />
            </div>
            <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
              Spaced Repetition
            </h1>
          </div>

          <Link href={`/${username}/${slug}`} className="sm:hidden">
            <Button variant="outline" size="sm" className="rounded-xl gap-2 font-medium">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>

          <Link href={`/${username}/${slug}`} className="hidden sm:block">
            <Button variant="outline" className="gap-2 rounded-xl font-medium">
              <ArrowLeft className="h-4 w-4" />
              Back to Deck
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-4 sm:mt-8 flex min-h-0 flex-1 flex-col items-center justify-center">
        {isLoading ? (
          <div className="flex w-full flex-1 flex-col items-center justify-center space-y-4">
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
            <Link href={`/${username}/${slug}`} className="w-full">
              <Button size="lg" className="w-full" variant="outline">
                Return to Deck
              </Button>
            </Link>
          </div>
        ) : currentCard ? (
          <div className="flex min-h-0 w-full flex-1 flex-col sm:flex-none">
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

            <div className="mt-4 sm:mt-8 px-4 sm:px-8">
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-1 gap-2">
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
                <div className="min-w-[40px] sm:min-w-[80px] text-right text-sm font-medium whitespace-nowrap text-muted-foreground">
                  {totalRemaining} <span className="hidden sm:inline">Total</span>
                </div>
              </div>
            </div>

            <div
              className={`mt-4 sm:mt-8 grid w-full grid-cols-2 gap-3 sm:flex sm:flex-row transition-opacity duration-300 ${isFlipped ? "opacity-100" : "pointer-events-none opacity-0"}`}
            >
              <Button
                size="lg"
                variant="destructive"
                className="h-auto w-full sm:flex-1 flex-row items-center justify-center gap-2 py-3"
                onClick={() => handleRating(0)}
              >
                <span className="text-sm sm:text-base font-semibold">Again</span>
                <span className="text-xs opacity-90 font-normal">
                  {previewIntervals.again}
                </span>
              </Button>

              <Button
                size="lg"
                className="h-auto w-full sm:flex-1 flex-row items-center justify-center gap-2 bg-orange-500 py-3 text-white hover:bg-orange-600"
                onClick={() => handleRating(1)}
              >
                <span className="text-sm sm:text-base font-semibold">Hard</span>
                <span className="text-xs opacity-90 font-normal">
                  {previewIntervals.hard}
                </span>
              </Button>

              <Button
                size="lg"
                className="h-auto w-full sm:flex-1 flex-row items-center justify-center gap-2 bg-blue-500 py-3 text-white hover:bg-blue-600"
                onClick={() => handleRating(2)}
              >
                <span className="text-sm sm:text-base font-semibold">Good</span>
                <span className="text-xs opacity-90 font-normal">
                  {previewIntervals.good}
                </span>
              </Button>

              <Button
                size="lg"
                className="h-auto w-full sm:flex-1 flex-row items-center justify-center gap-2 bg-green-700 py-3 text-white hover:bg-green-800"
                onClick={() => handleRating(3)}
              >
                <span className="text-sm sm:text-base font-semibold">Easy</span>
                <span className="text-xs opacity-90 font-normal">
                  {previewIntervals.easy}
                </span>
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
