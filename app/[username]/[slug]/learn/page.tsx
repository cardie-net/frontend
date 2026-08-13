"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Check, X, RotateCcw, GraduationCap, Settings, Maximize } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useDeck } from "@/hooks/useDecks"
import { useLearningSession } from "@/hooks/useLearningSession"
import { useAuth } from "@/lib/AuthContext"
import { FlipCard } from "@/components/FlipCard"
import { CardElement } from "@/types"
import { getCardText, getCardImage } from "@/lib/cards"
import { shuffle, cn } from "@/lib/utils"
import { FullscreenImageViewer } from "@/components/shared/FullscreenImageViewer"

type OverrideValue = "default" | "yes" | "no"

interface MCOption {
  id: string
  cardId: string
  text: string
  imageUrl?: string | null
  isCorrect: boolean
}

function MCOptionThumbnail({ url }: { url: string }) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFullscreen(true)
  }

  return (
    <>
      <div
        className="group/image relative h-8 w-8 shrink-0 flex-shrink-0 cursor-pointer overflow-hidden rounded-md border"
        onClick={handleOpen}
      >
        <img
          src={url}
          alt=""
          className="h-full w-full object-cover transition-all duration-200 group-hover/image:blur-sm"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-200 group-hover/image:opacity-100">
          <Maximize className="h-4 w-4 text-white drop-shadow-md" />
        </div>
      </div>
      <FullscreenImageViewer
        src={url}
        isOpen={isFullscreen}
        onClose={() => setIsFullscreen(false)}
      />
    </>
  )
}

const LETTERS = ["A", "B", "C", "D"]

export default function LearnPage() {
  const params = useParams<{ username: string; slug: string }>()
  const username = params.username
  const slug = params.slug

  const { user } = useAuth()
  const { data: deck, isLoading: deckLoading } = useDeck(username, slug)

  const {
    loading: sessionLoading,
    error,
    sessionCompleted,
    currentCard,
    cards,
    isFlipped,
    setIsFlipped,
    handleAnswer,
    restartLearning,
    clearProgress,
    stats,
  } = useLearningSession(deck?.id || "")

  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)

  useEffect(() => {
    if (confirmClear) {
      const timer = setTimeout(() => setConfirmClear(false), 4000)
      return () => clearTimeout(timer)
    }
  }, [confirmClear])

  const [isReversed, setIsReversed] = useState(() => {
    if (typeof window === "undefined" || !username || !slug) return false
    try {
      const saved = localStorage.getItem(`learn_settings_${username}_${slug}`)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (typeof parsed.isReversed === "boolean") return parsed.isReversed
      }
    } catch (e) {
      console.error("Failed to load learn settings from localStorage", e)
    }
    return false
  })

  const [mcOverride, setMcOverride] = useState<OverrideValue>(() => {
    if (typeof window === "undefined" || !username || !slug) return "default"
    try {
      const saved = localStorage.getItem(`learn_settings_${username}_${slug}`)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.mcOverride === "yes" || parsed.mcOverride === "no") {
          return parsed.mcOverride
        }
        // Migrate old boolean format
        if (typeof parsed.isMultipleChoice === "boolean") {
          return parsed.isMultipleChoice ? "yes" : "no"
        }
      }
    } catch (e) {
      console.error("Failed to load learn settings from localStorage", e)
    }
    return "default"
  })

  const globalMcDefault = user?.preferences?.learning_multiple_choice ?? false
  const isMultipleChoice = mcOverride === "yes" ? true : mcOverride === "no" ? false : globalMcDefault

  useEffect(() => {
    if (!username || !slug) return
    const storageKey = `learn_settings_${username}_${slug}`
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        const timerId = window.setTimeout(() => {
          if (typeof parsed.isReversed === "boolean") {
            setIsReversed(parsed.isReversed)
          }
          if (parsed.mcOverride === "yes" || parsed.mcOverride === "no") {
            setMcOverride(parsed.mcOverride)
          } else if (typeof parsed.isMultipleChoice === "boolean") {
            // Migrate old boolean format
            setMcOverride(parsed.isMultipleChoice ? "yes" : "no")
          }
        }, 0)
        return () => window.clearTimeout(timerId)
      }
    } catch (e) {
      console.error("Failed to load learn settings from localStorage", e)
    }
  }, [username, slug])

  const handleToggleReversed = (checked: boolean) => {
    setIsReversed(checked)
    setIsFlipped(false)
    if (username && slug) {
      const storageKey = `learn_settings_${username}_${slug}`
      try {
        const saved = localStorage.getItem(storageKey)
        const parsed = saved ? JSON.parse(saved) : {}
        localStorage.setItem(
          storageKey,
          JSON.stringify({ ...parsed, isReversed: checked })
        )
      } catch (e) {
        console.error("Failed to save learn settings to localStorage", e)
      }
    }
  }

  const handleMcOverrideChange = (value: OverrideValue) => {
    setMcOverride(value)
    if (username && slug) {
      const storageKey = `learn_settings_${username}_${slug}`
      try {
        const saved = localStorage.getItem(storageKey)
        const parsed = saved ? JSON.parse(saved) : {}
        // Remove old boolean key, use new override key
        delete parsed.isMultipleChoice
        localStorage.setItem(
          storageKey,
          JSON.stringify({ ...parsed, mcOverride: value })
        )
      } catch (e) {
        console.error("Failed to save learn settings to localStorage", e)
      }
    }
  }

  const [mcOptions, setMcOptions] = useState<MCOption[]>([])
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [isAnswering, setIsAnswering] = useState(false)

  // Keep track of what to show on the back of the card so it doesn't change text while flipping away
  const [backContent, setBackContent] = useState<CardElement[] | null>(null)

  const isLoading = deckLoading || (!!deck && sessionLoading)

  // Compute progress bar percentages
  const box1Percent = stats.total > 0 ? (stats.box1 / stats.total) * 100 : 0
  const box2Percent = stats.total > 0 ? (stats.box2 / stats.total) * 100 : 0
  const box3Percent = stats.total > 0 ? (stats.box3 / stats.total) * 100 : 0

  const handleAnswerClick = useCallback((knewIt: boolean) => {
    setIsFlipped(false)
    handleAnswer(knewIt)
  }, [setIsFlipped, handleAnswer])

  const toggleFlip = useCallback(() => {
    if (!currentCard) return
    if (!isFlipped) {
      setBackContent(isReversed ? currentCard.front : currentCard.back)
      setIsFlipped(true)
    } else {
      setIsFlipped(false)
    }
  }, [currentCard, isFlipped, isReversed, setIsFlipped])

  useEffect(() => {
    if (!currentCard || !cards || cards.length === 0) {
      setMcOptions([])
      return
    }

    const qSide = isReversed ? "front" : "back"
    const correctText = getCardText(currentCard[qSide]) || ""
    const correctImage = getCardImage(currentCard[qSide])?.url || null

    const correctOption: MCOption = {
      id: `${currentCard.id}-correct`,
      cardId: currentCard.id,
      text: correctText,
      imageUrl: correctImage,
      isCorrect: true,
    }

    const otherCards = cards.filter((c) => c.id !== currentCard.id)
    const shuffledOther = shuffle([...otherCards])

    const wrongOptions: MCOption[] = shuffledOther.slice(0, 3).map((c, idx) => ({
      id: `${c.id}-wrong-${idx}`,
      cardId: c.id,
      text: getCardText(c[qSide]) || "",
      imageUrl: getCardImage(c[qSide])?.url || null,
      isCorrect: false,
    }))

    setMcOptions(shuffle([correctOption, ...wrongOptions]))
    setSelectedOptionId(null)
    setIsAnswering(false)
  }, [currentCard, cards, isReversed])

  const handleSelectMCOption = useCallback(
    (opt: MCOption) => {
      if (isAnswering) return
      setSelectedOptionId(opt.id)
      setIsAnswering(true)
    },
    [isAnswering]
  )

  const handleNextMC = useCallback(() => {
    if (!isAnswering || !selectedOptionId) return
    const opt = mcOptions.find((o) => o.id === selectedOptionId)
    if (opt) {
      handleAnswerClick(opt.isCorrect)
    }
  }, [isAnswering, selectedOptionId, mcOptions, handleAnswerClick])

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
        if (!isMultipleChoice) {
          e.preventDefault()
          toggleFlip()
        } else if (isAnswering) {
          e.preventDefault()
          handleNextMC()
        }
      } else if (isMultipleChoice) {
        if (mcOptions.length > 0 && !isAnswering) {
          if (["1", "2", "3", "4"].includes(e.key)) {
            const index = parseInt(e.key, 10) - 1
            if (mcOptions[index]) {
              e.preventDefault()
              handleSelectMCOption(mcOptions[index])
            }
          }
        }
      } else {
        if (e.key === "1" || e.code === "Digit1" || e.code === "Numpad1") {
          e.preventDefault()
          handleAnswerClick(false)
        } else if (e.key === "2" || e.code === "Digit2" || e.code === "Numpad2") {
          e.preventDefault()
          handleAnswerClick(true)
        }
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
    handleAnswerClick,
    isMultipleChoice,
    mcOptions,
    isAnswering,
    handleSelectMCOption,
  ])

  return (
    <div className="container mx-auto flex h-[calc(100svh-64px)] overflow-hidden max-w-4xl flex-col space-y-4 sm:space-y-8 px-4 pt-8 pb-4 sm:px-10 sm:py-16">
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

          <div className="flex items-center gap-2">
            <Link href={`/${username}/${slug}`} className="sm:hidden">
              <Button variant="outline" size="sm" className="rounded-xl gap-2 font-medium">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>

            <Link href={`/${username}/${slug}`} className="hidden sm:block">
              <Button variant="outline" className="rounded-xl gap-2 font-medium">
                <ArrowLeft className="h-4 w-4" />
                Back to Deck
              </Button>
            </Link>

            <Button
              variant="outline"
              size="icon"
              className="rounded-xl"
              onClick={() => setIsSettingsOpen(true)}
              aria-label="Settings"
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
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
              <Link href={`/${username}/${slug}`} className="w-full sm:flex-1">
                <Button size="lg" className="w-full" variant="outline">
                  Return to Deck
                </Button>
              </Link>
              <Button size="lg" className="w-full sm:flex-1" onClick={restartLearning}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Restart Learning
              </Button>
            </div>
          </div>
        ) : currentCard ? (
          <div className="flex min-h-0 w-full flex-1 flex-col sm:flex-none">
            {/* Card Component */}
            <FlipCard
              front={isReversed ? currentCard.back : currentCard.front}
              back={isReversed ? currentCard.front : currentCard.back}
              flipped={isFlipped}
              backContent={backContent}
              onFlip={toggleFlip}
              disableFlip={isMultipleChoice}
            />

            <div className="mt-3 sm:mt-8 px-4 sm:px-8">
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
            {isMultipleChoice ? (
              <div className="w-full">
                <div className="mt-3 sm:mt-8 grid grid-cols-2 gap-2 sm:gap-3 w-full">
                  {mcOptions.map((opt, idx) => (
                    <Button
                      key={opt.id}
                      variant="outline"
                      className={cn(
                        "h-12 sm:h-14 flex items-center justify-between px-2 sm:px-4 text-left font-medium rounded-xl border border-border transition-all shadow-sm",
                        selectedOptionId !== null &&
                          opt.id === selectedOptionId &&
                          opt.isCorrect &&
                          "bg-green-600 text-white border-green-600 hover:bg-green-600 dark:bg-green-700",
                        selectedOptionId !== null &&
                          opt.id === selectedOptionId &&
                          !opt.isCorrect &&
                          "bg-destructive text-destructive-foreground border-destructive hover:bg-destructive",
                        selectedOptionId !== null &&
                          opt.id !== selectedOptionId &&
                          opt.isCorrect &&
                          "bg-green-600/80 text-white border-green-600",
                        selectedOptionId !== null &&
                          opt.id !== selectedOptionId &&
                          !opt.isCorrect &&
                          "opacity-40 pointer-events-none"
                      )}
                      onClick={() => handleSelectMCOption(opt)}
                      disabled={isAnswering}
                    >
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 pr-1 sm:pr-2">
                        <span
                          className={cn(
                            "hidden sm:flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground transition-colors",
                            selectedOptionId !== null &&
                              (opt.id === selectedOptionId || opt.isCorrect) &&
                              "bg-white/20 text-white"
                          )}
                        >
                          {LETTERS[idx] || idx + 1}
                        </span>
                        {opt.imageUrl && <MCOptionThumbnail url={opt.imageUrl} />}
                        <span className="truncate text-sm sm:text-base font-normal">
                          {opt.text ? opt.text : (!opt.imageUrl && <span className="italic text-muted-foreground">Empty</span>)}
                        </span>
                      </div>
                      <Kbd
                        className={cn(
                          "hidden sm:inline-flex shrink-0 ml-2",
                          selectedOptionId !== null &&
                            (opt.id === selectedOptionId || opt.isCorrect) &&
                            "bg-white/20 text-white border-transparent"
                        )}
                      >
                        {idx + 1}
                      </Kbd>
                    </Button>
                  ))}
                </div>
                <div
                  className={cn(
                    "mt-3 sm:mt-6 flex justify-center w-full transition-opacity duration-300",
                    isAnswering ? "opacity-100" : "opacity-0 pointer-events-none"
                  )}
                >
                  <Button
                    size="lg"
                    className="w-full sm:w-1/2 md:w-1/3 h-12 sm:h-14 font-semibold shadow-sm"
                    onClick={handleNextMC}
                  >
                    Next
                    <Kbd className="hidden sm:inline-flex ml-2 bg-primary-foreground/20 text-primary-foreground border-transparent">
                      Enter
                    </Kbd>
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className={`mt-4 sm:mt-8 flex w-full gap-4 transition-opacity duration-300 ${isFlipped ? "opacity-100" : "pointer-events-none opacity-0"}`}
              >
                <Button
                  size="lg"
                  variant="destructive"
                  className="group h-14 flex-1 font-semibold"
                  onClick={() => handleAnswerClick(false)}
                >
                  <X className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                  <span>Didn&apos;t Know</span>
                  <Kbd className="hidden sm:inline-flex ml-2 bg-background/20 text-destructive-foreground">
                    1
                  </Kbd>
                </Button>

                <Button
                  size="lg"
                  className="group h-14 flex-1 bg-green-700 text-white hover:bg-green-800 font-semibold"
                  onClick={() => handleAnswerClick(true)}
                >
                  <Check className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                  <span>Knew It</span>
                  <Kbd className="hidden sm:inline-flex ml-2 bg-background/20 text-white">
                    2
                  </Kbd>
                </Button>
              </div>
            )}
          </div>
        ) : null}
      </div>

      <Dialog
        open={isSettingsOpen}
        onOpenChange={(open) => {
          setIsSettingsOpen(open)
          if (!open) setConfirmClear(false)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="flex flex-row items-center gap-3 space-y-0 text-left">
            <div className="p-2 rounded-2xl bg-primary/10 text-primary">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">Learn Settings</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Defaults can be configured in{" "}
                <Link
                  href="/settings#learning-settings"
                  className="text-primary underline underline-offset-2 hover:text-primary/80"
                  onClick={() => setIsSettingsOpen(false)}
                >
                  settings
                </Link>
                .
              </DialogDescription>
            </div>
          </DialogHeader>
          <div className="space-y-6 py-2">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label htmlFor="reverse-cards" className="text-sm font-medium leading-none cursor-pointer">
                  Reverse cards
                </Label>
                <p className="text-xs text-muted-foreground">
                  Show back side first, then front after flipping
                </p>
              </div>
              <Switch
                id="reverse-cards"
                checked={isReversed}
                onCheckedChange={(checked) => handleToggleReversed(checked)}
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label htmlFor="multiple-choice" className="text-sm font-medium leading-none cursor-pointer">
                  Multiple choice answers
                </Label>
                <p className="text-xs text-muted-foreground">
                  Show 4 multiple choice options instead of Knew / Didn&apos;t know buttons
                </p>
              </div>
              <Select
                value={mcOverride}
                onValueChange={(v) => handleMcOverrideChange(v as OverrideValue)}
              >
                <SelectTrigger size="sm" className="w-[110px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-end sm:justify-between gap-4 pt-0 sm:pt-2 sm:border-t">
              <div className="hidden sm:block space-y-0.5">
                <span className="text-sm font-medium leading-none text-destructive">
                  Reset Progress
                </span>
                <p className="text-xs text-muted-foreground">
                  Clear all card progress for this deck
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="w-[140px] rounded-xl gap-2 font-medium shrink-0 justify-center transition-all"
                onClick={() => {
                  if (!confirmClear) {
                    setConfirmClear(true)
                  } else {
                    clearProgress()
                    setConfirmClear(false)
                    setIsSettingsOpen(false)
                  }
                }}
              >
                <RotateCcw className="h-4 w-4" />
                {confirmClear ? "Are you sure?" : "Clear Progress"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
