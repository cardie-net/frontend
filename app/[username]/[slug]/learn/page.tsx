"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Check, X, RotateCcw, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useDeck } from "@/hooks/useDecks"
import { useLearningSession } from "@/hooks/useLearningSession"
import { FlipCard } from "@/components/FlipCard"
import { CardElement } from "@/types"

export default function LearnPage() {
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
    handleAnswer,
    restartLearning,
    clearProgress,
    stats,
  } = useLearningSession(deck?.id || "")

  // Keep track of what to show on the back of the card so it doesn't change text while flipping away
  const [backContent, setBackContent] = useState<CardElement[] | null>(null)

  const isLoading = deckLoading || (!!deck && sessionLoading)

  // Compute progress bar percentages
  const box1Percent = stats.total > 0 ? (stats.box1 / stats.total) * 100 : 0
  const box2Percent = stats.total > 0 ? (stats.box2 / stats.total) * 100 : 0
  const box3Percent = stats.total > 0 ? (stats.box3 / stats.total) * 100 : 0

  const handleAnswerClick = (knewIt: boolean) => {
    setIsFlipped(false)
    handleAnswer(knewIt)
  }

  return (
    <div className="container mx-auto flex h-[calc(100dvh-64px)] overflow-hidden max-w-4xl flex-col space-y-4 sm:space-y-8 px-4 pt-8 pb-2 sm:px-10 sm:py-16">
      <div className="flex flex-col">
        <div className="flex justify-start sm:justify-between gap-4 items-center">
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex shrink-0 items-center justify-center rounded-2xl bg-primary/10 p-2.5 text-primary shadow-sm">
              <GraduationCap className="h-6 w-6" />
            </div>
            <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
              Learn
            </h1>
          </div>

          <div className="flex sm:hidden items-center gap-2">
            <Link href={`/${username}/${slug}`}>
              <Button variant="outline" size="sm" className="rounded-xl gap-2 font-medium">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl gap-2 font-medium"
              onClick={clearProgress}
              title="Clear Progress"
            >
              <RotateCcw className="h-4 w-4" />
              Clear
            </Button>
          </div>

          <div className="hidden items-center justify-end gap-2 sm:flex">
            <Button
              variant="outline"
              className="gap-2 rounded-xl font-medium"
              onClick={clearProgress}
              title="Clear Progress"
            >
              <RotateCcw className="h-4 w-4" />
              Clear
            </Button>
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
              You have mastered all the cards currently available in this deck.
            </p>
            <div className="flex w-full flex-col gap-3 sm:flex-row">
              <Link href={`/${username}/${slug}`} className="flex-1">
                <Button size="lg" className="w-full" variant="outline">
                  Return to Deck
                </Button>
              </Link>
              <Button size="lg" className="flex-1" onClick={restartLearning}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Restart Learning
              </Button>
            </div>
          </div>
        ) : currentCard ? (
          <div className="flex min-h-0 w-full flex-1 flex-col sm:flex-none">
            {/* Card Component */}
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
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  {/* Progress bar container */}
                  <div className="flex h-2 w-full overflow-hidden rounded-full bg-secondary shadow-inner">
                    {/* Box 3 - Green (Mastered) */}
                    <div
                      className="h-full bg-green-500 transition-all duration-300 ease-in-out"
                      style={{ width: `${box3Percent}%` }}
                      title={`Mastered: ${stats.box3}`}
                    />
                    {/* Box 2 - Yellow (Reviewing) */}
                    <div
                      className="h-full bg-yellow-400 transition-all duration-300 ease-in-out"
                      style={{ width: `${box2Percent}%` }}
                      title={`Reviewing: ${stats.box2}`}
                    />
                    {/* Box 1 - Grey (Learning/New) */}
                    <div
                      className="h-full bg-gray-400 transition-all duration-300 ease-in-out dark:bg-gray-500"
                      style={{ width: `${box1Percent}%` }}
                      title={`Learning: ${stats.box1}`}
                    />
                  </div>
                </div>
                <div className="min-w-[40px] sm:min-w-[80px] text-right text-sm font-medium whitespace-nowrap text-muted-foreground">
                  {stats.box3} / {stats.total} <span className="hidden sm:inline">Mastered</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div
              className={`mt-4 sm:mt-8 flex w-full gap-4 transition-opacity duration-300 ${isFlipped ? "opacity-100" : "pointer-events-none opacity-0"}`}
            >
              <Button
                size="lg"
                variant="destructive"
                className="group h-14 flex-1"
                onClick={() => handleAnswerClick(false)}
              >
                <X className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                Didn&apos;t Know
              </Button>

              <Button
                size="lg"
                className="group h-14 flex-1 bg-green-700 text-white hover:bg-green-800"
                onClick={() => handleAnswerClick(true)}
              >
                <Check className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                Knew It
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
