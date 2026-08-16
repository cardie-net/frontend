"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { ArrowLeft, Check, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useDeck } from "@/hooks/useDecks"
import { useSRSSession } from "@/hooks/useSRSSession"
import { FlipCard } from "@/components/FlipCard"
import { CardElement } from "@/types"

export default function SpacedRepetitionPage() {
  const t = useTranslations("SpacedRepetition")
  const tCommon = useTranslations("Common")
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

  const toggleFlip = useCallback(() => {
    if (!currentCard) return
    if (!isFlipped) {
      setBackContent(currentCard.back)
      setIsFlipped(true)
    } else {
      setIsFlipped(false)
    }
  }, [currentCard, isFlipped, setIsFlipped])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return
      }

      if (isLoading || error || sessionCompleted || !currentCard) return

      if (e.key === "Enter" || e.key === " " || e.code === "Space") {
        e.preventDefault()
        toggleFlip()
      } else if (e.key === "1" || e.code === "Digit1" || e.code === "Numpad1") {
        e.preventDefault()
        handleRating(0)
      } else if (e.key === "2" || e.code === "Digit2" || e.code === "Numpad2") {
        e.preventDefault()
        handleRating(1)
      } else if (e.key === "3" || e.code === "Digit3" || e.code === "Numpad3") {
        e.preventDefault()
        handleRating(2)
      } else if (e.key === "4" || e.code === "Digit4" || e.code === "Numpad4") {
        e.preventDefault()
        handleRating(3)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [
    isLoading,
    error,
    sessionCompleted,
    currentCard,
    toggleFlip,
    handleRating,
  ])

  return (
    <div className="container mx-auto flex h-[calc(100dvh-64px)] overflow-hidden max-w-4xl flex-col space-y-4 sm:space-y-8 px-4 pt-8 pb-2 sm:px-10 sm:py-16">
      <div className="flex flex-col">
        <div className="flex justify-start sm:justify-between gap-4 items-center">
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex shrink-0 items-center justify-center rounded-2xl bg-primary/10 p-2.5 text-primary shadow-sm">
              <Clock className="h-6 w-6" />
            </div>
            <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
              {t("title")}
            </h1>
          </div>

          <Link href={`/${username}/${slug}`} className="sm:hidden">
            <Button variant="outline" size="sm" className="rounded-xl gap-2 font-medium">
              <ArrowLeft className="h-4 w-4" />
              {t("back")}
            </Button>
          </Link>

          <Link href={`/${username}/${slug}`} className="hidden sm:block">
            <Button variant="outline" className="gap-2 rounded-xl font-medium">
              <ArrowLeft className="h-4 w-4" />
              {t("backToDeck")}
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
            <Button onClick={() => window.location.reload()}>{tCommon("tryAgain")}</Button>
          </div>
        ) : sessionCompleted ? (
          <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center text-center">
            <div className="mb-6 rounded-full bg-primary/10 p-6">
              <Check className="h-12 w-12 text-primary" />
            </div>
            <h2 className="mb-2 text-2xl font-bold">{t("sessionCompleteTitle")}</h2>
            <p className="mb-8 text-muted-foreground">
              {t("sessionCompleteDesc")}
            </p>
            <Link href={`/${username}/${slug}`} className="w-full">
              <Button size="lg" className="w-full" variant="outline">
                {t("returnToDeck")}
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
              onFlip={toggleFlip}
            />

            <div className="mt-4 sm:mt-8 px-4 sm:px-8">
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-1 gap-2">
                  {counts.newRemaining > 0 && (
                    <Badge variant="outline" className="border-blue-300 bg-blue-100 px-3 py-1 font-semibold text-blue-950 dark:border-blue-800 dark:bg-blue-950/80 dark:text-blue-200">
                      {counts.newRemaining} {t("new")}
                    </Badge>
                  )}
                  {counts.learningRemaining > 0 && (
                    <Badge variant="outline" className="border-orange-300 bg-orange-100 px-3 py-1 font-semibold text-orange-950 dark:border-orange-800 dark:bg-orange-950/80 dark:text-orange-200">
                      {counts.learningRemaining} {t("learning")}
                    </Badge>
                  )}
                  {counts.reviewRemaining > 0 && (
                    <Badge variant="outline" className="border-green-300 bg-green-100 px-3 py-1 font-semibold text-green-950 dark:border-green-800 dark:bg-green-950/80 dark:text-green-200">
                      {counts.reviewRemaining} {t("review")}
                    </Badge>
                  )}
                </div>
                <div className="min-w-[40px] sm:min-w-[80px] text-right text-sm font-medium whitespace-nowrap text-muted-foreground">
                  {totalRemaining} <span className="hidden sm:inline">{t("total")}</span>
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
                <span className="text-sm sm:text-base font-semibold flex items-center gap-1.5">
                  {t("again")}
                  <Kbd className="hidden sm:inline-flex bg-background/20 text-destructive-foreground">
                    1
                  </Kbd>
                </span>
                <span className="text-xs opacity-90 font-normal">
                  {previewIntervals.again}
                </span>
              </Button>

              <Button
                size="lg"
                className="h-auto w-full sm:flex-1 flex-row items-center justify-center gap-2 bg-orange-500 py-3 text-white hover:bg-orange-600"
                onClick={() => handleRating(1)}
              >
                <span className="text-sm sm:text-base font-semibold flex items-center gap-1.5">
                  {t("hard")}
                  <Kbd className="hidden sm:inline-flex bg-background/20 text-white">
                    2
                  </Kbd>
                </span>
                <span className="text-xs opacity-90 font-normal">
                  {previewIntervals.hard}
                </span>
              </Button>

              <Button
                size="lg"
                className="h-auto w-full sm:flex-1 flex-row items-center justify-center gap-2 bg-blue-500 py-3 text-white hover:bg-blue-600"
                onClick={() => handleRating(2)}
              >
                <span className="text-sm sm:text-base font-semibold flex items-center gap-1.5">
                  {t("good")}
                  <Kbd className="hidden sm:inline-flex bg-background/20 text-white">
                    3
                  </Kbd>
                </span>
                <span className="text-xs opacity-90 font-normal">
                  {previewIntervals.good}
                </span>
              </Button>

              <Button
                size="lg"
                className="h-auto w-full sm:flex-1 flex-row items-center justify-center gap-2 bg-green-700 py-3 text-white hover:bg-green-800"
                onClick={() => handleRating(3)}
              >
                <span className="text-sm sm:text-base font-semibold flex items-center gap-1.5">
                  {t("easy")}
                  <Kbd className="hidden sm:inline-flex bg-background/20 text-white">
                    4
                  </Kbd>
                </span>
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
