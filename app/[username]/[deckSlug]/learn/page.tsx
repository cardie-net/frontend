"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Check, X, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useDeck } from "@/hooks/useDecks"
import { useLearningSession } from "@/hooks/useLearningSession"
import { CardElement } from "@/types"

// Renders the card content based on element type
function RenderContent({ elements }: { elements: CardElement[] }) {
  if (!elements || elements.length === 0)
    return <div className="text-muted-foreground">Empty</div>
  return (
    <div className="space-y-4">
      {elements.map((el, i) => {
        if (el.type === "text") {
          return (
            <p key={i} className="whitespace-pre-wrap">
              {el.content}
            </p>
          )
        }
        return null
      })}
    </div>
  )
}

export default function LearnPage() {
  const params = useParams()
  const username = params.username as string
  const deckSlug = params.deckSlug as string

  const { data: deck, isLoading: deckLoading } = useDeck(username, deckSlug)

  const {
    loading: sessionLoading,
    error,
    sessionCompleted,
    currentCard,
    isFlipped,
    setIsFlipped,
    handleAnswer,
    restartLearning,
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
    <div className="container mx-auto flex min-h-[calc(100vh-64px)] max-w-4xl flex-col p-6">
      <div className="mb-8 flex items-center gap-4">
        <Link href={`/${username}/${deckSlug}`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Deck
          </Button>
        </Link>
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
        <div className="min-w-[80px] text-right text-sm font-medium whitespace-nowrap text-muted-foreground">
          {stats.box3} / {stats.total} Mastered
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
            You have mastered all the cards currently available in this deck.
          </p>
          <div className="flex w-full flex-col gap-3 sm:flex-row">
            <Link href={`/${username}/${deckSlug}`} className="flex-1">
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
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center">
          {/* Card Component */}
          <div className="relative min-h-[400px] w-full [perspective:1000px]">
            <div
              className={`h-full min-h-[400px] w-full cursor-pointer transition-all duration-500 [transform-style:preserve-3d] ${isFlipped ? "[transform:rotateY(180deg)]" : ""}`}
              onClick={() => {
                if (!isFlipped) {
                  setBackContent(currentCard.back)
                  setIsFlipped(true)
                }
              }}
            >
              {/* Front side */}
              <Card className="absolute inset-0 flex flex-col [backface-visibility:hidden]">
                <CardContent className="flex flex-1 items-center justify-center p-8 text-center text-xl">
                  <RenderContent elements={currentCard.front} />
                </CardContent>
                {!isFlipped && (
                  <div className="border-t bg-muted/20 p-4 text-center text-sm text-muted-foreground">
                    Click anywhere on the card to flip
                  </div>
                )}
              </Card>

              {/* Back side */}
              <Card className="absolute inset-0 flex [transform:rotateY(180deg)] flex-col [backface-visibility:hidden]">
                <CardContent className="flex flex-1 items-center justify-center p-8 text-center text-xl">
                  <RenderContent elements={backContent || currentCard.back} />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Action Buttons */}
          <div
            className={`mt-8 flex w-full gap-4 transition-opacity duration-300 ${isFlipped ? "opacity-100" : "pointer-events-none opacity-0"}`}
          >
            <Button
              size="lg"
              variant="outline"
              className="hover:text-destructive-foreground group h-14 flex-1 border-destructive text-destructive hover:bg-destructive"
              onClick={() => handleAnswerClick(false)}
            >
              <X className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
              Didn't Know
            </Button>

            <Button
              size="lg"
              className="group h-14 flex-1 bg-green-500 text-white hover:bg-green-600"
              onClick={() => handleAnswerClick(true)}
            >
              <Check className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
              Knew It
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
