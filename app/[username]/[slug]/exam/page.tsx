"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import { ArrowLeft, FileCheck, Check, X, RotateCcw, Send } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress as ProgressPrimitive } from "@base-ui/react/progress"
import { ProgressTrack, ProgressIndicator } from "@/components/ui/progress"
import { useDeck, useUpdateDeckExamScore } from "@/hooks/useDecks"
import { useCards } from "@/hooks/useCards"
import { getCardText } from "@/lib/cards"
import { shuffle, cn } from "@/lib/utils"

type AnswerOption = {
  id: string
  text: string
  isCorrect: boolean
}

type Question = {
  cardId: string
  prompt: string
  options: AnswerOption[]
  selectedOptionId: string | null
}

const LETTERS = ["A", "B", "C", "D"]

import { useActivityTracker } from "@/hooks/useActivityTracker"

export default function ExamPage() {
  const { username, slug } = useParams() as { username: string; slug: string }
  const searchParams = useSearchParams()
  const countParam = searchParams.get("count")
  const answerWith = searchParams.get("answerWith")

  const { trackExamSubmit } = useActivityTracker()
  const { data: deck, isLoading: deckLoading } = useDeck(username, slug)
  const { data: cards = [], isLoading: cardsLoading } = useCards(deck?.id)
  const updateExamScore = useUpdateDeckExamScore()

  const [questions, setQuestions] = useState<Question[]>([])
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [initError, setInitError] = useState(false)
  const firstUnansweredRef = useRef<HTMLDivElement | null>(null)


  const initializeQuestions = useCallback(() => {
    if (!cards || cards.length === 0) return

    if (!countParam || !answerWith) {
      setInitError(true)
      return
    }

    let numQuestions = parseInt(countParam, 10)
    if (isNaN(numQuestions) || numQuestions <= 0) {
      numQuestions = cards.length
    }
    numQuestions = Math.min(numQuestions, cards.length)

    const shuffledDeck = shuffle([...cards])
    const selectedCards = shuffledDeck.slice(0, numQuestions)

    const generatedQuestions: Question[] = selectedCards.map((card) => {
      let qSide: "front" | "back"
      let aSide: "front" | "back"

      if (answerWith === "front") {
        qSide = "back"
        aSide = "front"
      } else if (answerWith === "back") {
        qSide = "front"
        aSide = "back"
      } else {
        const isFront = Math.random() > 0.5
        qSide = isFront ? "back" : "front"
        aSide = isFront ? "front" : "back"
      }

      const prompt = getCardText(card[qSide])
      const correctAnswerText = getCardText(card[aSide])

      const correctOption: AnswerOption = {
        id: `${card.id}-correct`,
        text: correctAnswerText,
        isCorrect: true,
      }

      const otherCards = cards.filter((c) => c.id !== card.id)
      const shuffledOtherCards = shuffle([...otherCards])

      const wrongOptions = shuffledOtherCards.slice(0, 3).map((c, i) => ({
        id: `${card.id}-wrong-${i}`,
        text: getCardText(c[aSide]),
        isCorrect: false,
      }))

      return {
        cardId: card.id,
        prompt,
        options: shuffle([correctOption, ...wrongOptions]),
        selectedOptionId: null,
      }
    })

    setQuestions(generatedQuestions)
    setIsSubmitted(false)
    setInitError(false)
  }, [cards, countParam, answerWith])

  useEffect(() => {
    if (cards.length > 0 && questions.length === 0 && !initError) {
      const timer = setTimeout(() => {
        initializeQuestions()
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [cards, questions.length, initError, initializeQuestions])

  useEffect(() => {
    if (initError && typeof window !== "undefined") {
      window.location.replace(`/${username}/${slug}`)
    }
  }, [initError, username, slug])

  const handleSelectOption = (questionIndex: number, optionId: string) => {
    if (isSubmitted) return
    setQuestions((prev) => {
      const next = [...prev]
      next[questionIndex] = {
        ...next[questionIndex],
        selectedOptionId:
          next[questionIndex].selectedOptionId === optionId ? null : optionId,
      }
      return next
    })
  }

  const answeredCount = questions.filter((q) => q.selectedOptionId !== null).length
  const allAnswered = answeredCount === questions.length

  const handleSubmit = () => {
    if (!allAnswered) {
      firstUnansweredRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }
    setIsSubmitted(true)
    trackExamSubmit()
    if (deck?.id && questions.length > 0) {
      const calculatedScore = questions.filter(
        (q) => q.options.find((o) => o.id === q.selectedOptionId)?.isCorrect
      ).length
      const percentage = Math.round((calculatedScore / questions.length) * 100)
      updateExamScore.mutate({ deckId: deck.id, scorePercentage: percentage })
    }
    window.scrollTo({ top: 0, behavior: "smooth" })
  }


  const score = questions.filter(
    (q) => q.options.find((o) => o.id === q.selectedOptionId)?.isCorrect
  ).length

  const handleTryAgain = () => {
    setQuestions([])
  }

  const isLoading = deckLoading || cardsLoading

  if (isLoading || (questions.length === 0 && !initError)) {
    return (
      <div className="container mx-auto flex max-w-4xl flex-col space-y-6 sm:space-y-8 px-4 pt-8 pb-24 sm:px-10 sm:py-16">
        <div className="flex justify-between items-center">
          <div className="hidden sm:flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-2xl" />
            <Skeleton className="h-8 w-32" />
          </div>
          <Skeleton className="h-9 w-24 rounded-xl sm:hidden" />
          <Skeleton className="h-9 w-32 rounded-xl hidden sm:block" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-16 w-full rounded-2xl" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!cards || cards.length === 0) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-16 text-center">
        <h2 className="text-2xl font-bold">No cards found in this deck</h2>
        <Link href={`/${username}/${slug}`} className={buttonVariants({ className: "mt-4 rounded-xl" })}>Back to Deck</Link>
      </div>
    )
  }

  const firstUnansweredIndex = questions.findIndex((q) => q.selectedOptionId === null)

  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0
  let resultColor = "bg-green-500"
  if (percentage < 60) resultColor = "bg-red-500"
  else if (percentage < 80) resultColor = "bg-amber-500"

  return (
    <div className="container mx-auto flex max-w-4xl flex-col space-y-6 sm:space-y-8 px-4 pt-8 pb-24 sm:px-10 sm:py-16 sm:pb-24">
      {/* Header */}
      <div className="flex flex-col">
        <div className="flex justify-start sm:justify-between gap-4 items-center">
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex shrink-0 items-center justify-center rounded-2xl bg-primary/10 p-2.5 text-primary shadow-sm">
              <FileCheck className="h-6 w-6" />
            </div>
            <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
              {isSubmitted ? "Exam Results" : "Exam"}
            </h1>
          </div>

          <Link href={`/${username}/${slug}`} className="sm:hidden">
            <Button variant="outline" size="sm" className="rounded-xl gap-2 font-medium">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>

          <div className="hidden items-center justify-end gap-3 sm:flex">
            {!isSubmitted ? (
              <div className="text-sm font-medium text-muted-foreground">
                {answeredCount} of {questions.length} answered
              </div>
            ) : (
              <div className="text-sm font-medium text-primary">
                {score} of {questions.length} correct ({percentage}%)
              </div>
            )}
            <Link href={`/${username}/${slug}`}>
              <Button variant="outline" className="gap-2 rounded-xl font-medium">
                <ArrowLeft className="h-4 w-4" />
                Back to Deck
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Results summary banner — only shown after submit */}
      {isSubmitted && (
        <Card className="rounded-2xl">
          <CardContent className="flex flex-col items-center gap-4 py-8 sm:flex-row sm:gap-8 sm:py-6 sm:px-10">
            <div>
              <div className="text-4xl font-bold">
                {score}
                <span className="text-2xl text-muted-foreground">/{questions.length}</span>
              </div>
              <div className="text-sm text-muted-foreground">{percentage}% Score</div>
            </div>
            <div className="flex w-full flex-1 flex-col gap-3 sm:gap-3">
              <ProgressPrimitive.Root value={percentage} className="flex w-full">
                <ProgressTrack className="h-3">
                  <ProgressIndicator className={resultColor} />
                </ProgressTrack>
              </ProgressPrimitive.Root>
              <div className="flex justify-end gap-3">
                <Button onClick={handleTryAgain} variant="outline" size="sm" className="rounded-xl flex-1 sm:flex-none">
                  <RotateCcw className="mr-2 h-3.5 w-3.5" /> Try Again
                </Button>
                <Link href={`/${username}/${slug}`} className={buttonVariants({ variant: "outline", size: "sm", className: "rounded-xl flex-1 sm:flex-none justify-center" })}>
                  Back to Deck
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions list */}
      <div className="space-y-8">
        {questions.map((question, qIndex) => {
          const isUnanswered = question.selectedOptionId === null
          const isFirstUnanswered = qIndex === firstUnansweredIndex

          const selectedOption = question.options.find(
            (o) => o.id === question.selectedOptionId
          )
          const isCorrectAnswer = selectedOption?.isCorrect ?? false

          return (
            <div
              key={question.cardId}
              ref={isFirstUnanswered && !isSubmitted ? firstUnansweredRef : undefined}
              className="space-y-4"
            >
              {/* Question header + prompt */}
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
                    isSubmitted
                      ? isCorrectAnswer
                        ? "bg-green-500/10 text-green-600 dark:text-green-400"
                        : "bg-red-500/10 text-red-600 dark:text-red-400"
                      : isUnanswered
                        ? "bg-muted text-muted-foreground"
                        : "bg-primary/10 text-primary"
                  )}
                >
                  {isSubmitted ? (
                    isCorrectAnswer ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <X className="h-4 w-4" />
                    )
                  ) : (
                    qIndex + 1
                  )}
                </div>
                <p className="pt-1 text-base font-medium sm:text-lg">{question.prompt}</p>
              </div>

              {/* Answer options */}
              <div className="grid grid-cols-1 gap-3 pl-11 sm:grid-cols-2">
                {question.options.map((option, oIndex) => {
                  const isSelected = question.selectedOptionId === option.id
                  const isCorrect = option.isCorrect

                  let optionClass =
                    "h-auto min-h-[3rem] py-3 px-4 justify-start text-left text-sm sm:text-base relative whitespace-normal rounded-xl"

                  if (isSubmitted) {
                    if (isCorrect) {
                      optionClass = cn(
                        optionClass,
                        "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400"
                      )
                    } else if (isSelected && !isCorrect) {
                      optionClass = cn(
                        optionClass,
                        "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400"
                      )
                    } else {
                      optionClass = cn(optionClass, "opacity-40")
                    }
                  } else if (isSelected) {
                    optionClass = cn(
                      optionClass,
                      "border-primary bg-primary/10 text-primary"
                    )
                  } else {
                    optionClass = cn(
                      optionClass,
                      "hover:bg-accent hover:text-accent-foreground"
                    )
                  }

                  return (
                    <Button
                      key={option.id}
                      variant="outline"
                      className={optionClass}
                      onClick={() => handleSelectOption(qIndex, option.id)}
                      disabled={isSubmitted}
                    >
                      <span
                        className={cn(
                          "mr-3 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-semibold",
                          isSubmitted && isCorrect
                            ? "bg-green-500/20"
                            : isSubmitted && isSelected && !isCorrect
                              ? "bg-red-500/20"
                              : isSelected
                                ? "bg-primary/20"
                                : "bg-muted"
                        )}
                      >
                        {LETTERS[oIndex]}
                      </span>
                      <span className="flex-1 break-words pr-6">{option.text}</span>
                      {isSubmitted && isCorrect && (
                        <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500" />
                      )}
                      {isSubmitted && isSelected && !isCorrect && (
                        <X className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-red-500" />
                      )}
                      {!isSubmitted && isSelected && (
                        <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                      )}
                    </Button>
                  )
                })}
              </div>

              {/* Show correct answer text after submit if user was wrong */}
              {isSubmitted && !isCorrectAnswer && (
                <p className="pl-11 text-sm text-muted-foreground">
                  Correct answer:{" "}
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {question.options.find((o) => o.isCorrect)?.text}
                  </span>
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* Sticky submit bar */}
      {!isSubmitted && (
        <div className="fixed inset-x-0 bottom-0 z-10 border-t bg-background/80 backdrop-blur-lg">
          <div className="container mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-10">
            <div className="flex items-center gap-3">
              <ProgressPrimitive.Root
                value={questions.length > 0 ? (answeredCount / questions.length) * 100 : 0}
                className="flex w-20 sm:w-28"
              >
                <ProgressTrack>
                  <ProgressIndicator className="bg-primary" />
                </ProgressTrack>
              </ProgressPrimitive.Root>
              <span className="text-sm text-muted-foreground font-medium">
                {answeredCount}/{questions.length}
              </span>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!allAnswered}
              className="gap-2 rounded-xl"
            >
              <Send className="h-4 w-4" />
              Submit Exam
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
