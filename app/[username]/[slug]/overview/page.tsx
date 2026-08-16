"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, AlertCircle, Loader2, Eye, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { Flashcard } from "@/components/Flashcard"
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Progress } from "@/components/ui/progress"
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
import { useCards } from "@/hooks/useCards"
import { useActivityTracker } from "@/hooks/useActivityTracker"
import { useAuth } from "@/lib/AuthContext"

type OverrideValue = "default" | "yes" | "no"

function shuffleList<T>(list: T[]): T[] {
  const array = [...list]
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

function resolveOverride(override: OverrideValue, globalDefault: boolean): boolean {
  if (override === "yes") return true
  if (override === "no") return false
  return globalDefault
}

export default function OverviewPage() {
  const params = useParams<{ username: string; slug: string }>()
  const username = params.username
  const slug = params.slug

  const { user } = useAuth()
  const { trackOverviewCard } = useActivityTracker()

  const { data: deck, isLoading: deckLoading, error } = useDeck(username, slug)
  const { data: cards = [], isLoading: cardsLoading } = useCards(deck?.id)

  const loading = deckLoading || (!!deck && cardsLoading)

  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const [isReversed, setIsReversed] = useState(() => {
    if (typeof window === "undefined" || !username || !slug) return false
    try {
      const saved = localStorage.getItem(
        `overview_settings_${username}_${slug}`
      )
      if (saved) {
        const parsed = JSON.parse(saved)
        if (typeof parsed.isReversed === "boolean") return parsed.isReversed
      }
    } catch (e) {
      console.error("Failed to load overview settings from localStorage", e)
    }
    return false
  })

  const [shuffleOverride, setShuffleOverride] = useState<OverrideValue>(() => {
    if (typeof window === "undefined" || !username || !slug) return "default"
    try {
      const saved = localStorage.getItem(
        `overview_settings_${username}_${slug}`
      )
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.shuffleOverride === "yes" || parsed.shuffleOverride === "no") {
          return parsed.shuffleOverride
        }
        // Migrate old boolean format
        if (typeof parsed.isShuffled === "boolean") {
          return parsed.isShuffled ? "yes" : "no"
        }
      }
    } catch (e) {
      console.error("Failed to load overview settings from localStorage", e)
    }
    return "default"
  })

  const globalShuffleDefault = user?.preferences?.overview_shuffle ?? false
  const isShuffled = resolveOverride(shuffleOverride, globalShuffleDefault)

  useEffect(() => {
    if (!username || !slug) return
    const storageKey = `overview_settings_${username}_${slug}`
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        const timerId = window.setTimeout(() => {
          if (typeof parsed.isReversed === "boolean")
            setIsReversed(parsed.isReversed)
          if (parsed.shuffleOverride === "yes" || parsed.shuffleOverride === "no") {
            setShuffleOverride(parsed.shuffleOverride)
          } else if (typeof parsed.isShuffled === "boolean") {
            // Migrate old boolean format
            setShuffleOverride(parsed.isShuffled ? "yes" : "no")
          }
        }, 0)
        return () => window.clearTimeout(timerId)
      }
    } catch (e) {
      console.error("Failed to load overview settings from localStorage", e)
    }
  }, [username, slug])

  const [shuffledCards, setShuffledCards] = useState<typeof cards>([])

  useEffect(() => {
    if (isShuffled && cards.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShuffledCards(shuffleList(cards))
    } else {
      setShuffledCards([])
    }
  }, [cards, isShuffled])

  const handleToggleReversed = (checked: boolean) => {
    setIsReversed(checked)
    setIsFlipped(false)
    if (username && slug) {
      const storageKey = `overview_settings_${username}_${slug}`
      try {
        const saved = localStorage.getItem(storageKey)
        const parsed = saved ? JSON.parse(saved) : {}
        localStorage.setItem(
          storageKey,
          JSON.stringify({ ...parsed, isReversed: checked })
        )
      } catch (e) {
        console.error("Failed to save overview settings to localStorage", e)
      }
    }
  }

  const handleShuffleOverrideChange = (value: OverrideValue) => {
    setShuffleOverride(value)
    setIsFlipped(false)
    if (api) {
      api.scrollTo(0)
    }
    if (username && slug) {
      const storageKey = `overview_settings_${username}_${slug}`
      try {
        const saved = localStorage.getItem(storageKey)
        const parsed = saved ? JSON.parse(saved) : {}
        // Remove old boolean key, use new override key
        delete parsed.isShuffled
        localStorage.setItem(
          storageKey,
          JSON.stringify({ ...parsed, shuffleOverride: value })
        )
      } catch (e) {
        console.error("Failed to save overview settings to localStorage", e)
      }
    }
  }

  const activeCards = useMemo(() => {
    return isShuffled && shuffledCards.length > 0 ? shuffledCards : cards
  }, [isShuffled, shuffledCards, cards])

  const displayedCards = useMemo(() => {
    return activeCards.map((card) =>
      isReversed ? { ...card, front: card.back, back: card.front } : card
    )
  }, [activeCards, isReversed])

  useEffect(() => {
    if (!api) return

    const update = () => {
      setCount(api.scrollSnapList().length)
      setCurrent(api.selectedScrollSnap() + 1)
      setIsFlipped(false)
    }

    const handleSelect = () => {
      update()
      trackOverviewCard()
    }

    api.on("select", handleSelect)
    api.on("reInit", update)
    // Defer the initial sync: the carousel has already initialized before this
    // effect runs, and calling setState synchronously here is flagged by
    // react-hooks/set-state-in-effect.
    const id = window.setTimeout(update, 0)

    return () => {
      window.clearTimeout(id)
      api.off("select", handleSelect)
      api.off("reInit", update)
    }
  }, [api, trackOverviewCard])

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

      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault()
        api?.scrollPrev()
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault()
        api?.scrollNext()
      } else if (e.key === "Enter" || e.key === " " || e.code === "Space") {
        e.preventDefault()
        setIsFlipped((prev) => !prev)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [api])

  if (loading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !deck) {
    return (
      <div className="container mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
          <h2 className="mb-4 text-2xl font-bold">
            {error?.message || "Deck not found"}
          </h2>
          <Link href={`/${username}/${slug}`}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to deck
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto flex h-[calc(100dvh-64px)] max-w-4xl flex-col space-y-4 overflow-hidden px-4 pt-8 pb-2 sm:space-y-8 sm:px-10 sm:py-16">
      <div className="flex flex-col">
        <div className="flex items-center justify-start gap-4 sm:justify-between">
          <div className="hidden items-center gap-3 sm:flex">
            <div className="flex shrink-0 items-center justify-center rounded-2xl bg-primary/10 p-2.5 text-primary shadow-sm">
              <Eye className="h-6 w-6" />
            </div>
            <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
              Overview
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/${username}/${slug}`} className="sm:hidden">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-xl font-medium"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>

            <Link href={`/${username}/${slug}`} className="hidden sm:block">
              <Button
                variant="outline"
                className="gap-2 rounded-xl font-medium"
              >
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

      <div className="mt-4 flex min-h-0 flex-1 flex-col items-center justify-center sm:mt-8">
        <div className="flex min-h-0 w-full flex-1 flex-col sm:flex-none">
          <Carousel
            setApi={setApi}
            className="flex min-h-0 w-full flex-1 flex-col sm:flex-none"
          >
            <CarouselContent className="min-h-0 flex-1 sm:flex-none">
              {displayedCards.map((card, index) => (
                <CarouselItem key={card.id} className="flex min-h-0 flex-col">
                  <div className="flex min-h-0 flex-1 flex-col p-1 sm:flex-none">
                    <Flashcard
                      card={card}
                      flipped={index === current - 1 ? isFlipped : false}
                      onFlip={() => setIsFlipped((prev) => !prev)}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>

          <div className="mt-4 px-8 sm:mt-8">
            <Progress
              value={count > 0 ? (current / count) * 100 : 0}
              className="h-2"
            />
            <div className="mt-2 text-center text-sm font-medium text-muted-foreground sm:mt-3">
              Card {current} of {count}
            </div>
          </div>

          <div className="mt-1 text-center text-xs text-muted-foreground sm:mt-2">
            <span className="sm:hidden">
              Click anywhere on the card to flip
            </span>
            <span className="hidden items-center justify-center gap-1.5 sm:inline-flex">
              Click anywhere on the card or press{" "}
              <Kbd className="text-[10px]">Space</Kbd> /{" "}
              <Kbd className="text-[10px]">Enter</Kbd> to flip &bull; Use
              arrow keys to navigate
            </span>
          </div>
        </div>
      </div>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="flex flex-row items-center gap-3 space-y-0 text-left">
            <div className="p-2 rounded-2xl bg-primary/10 text-primary">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">Overview Settings</DialogTitle>
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
                <Label
                  htmlFor="reverse-cards"
                  className="cursor-pointer text-sm leading-none font-medium"
                >
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
                <Label
                  htmlFor="shuffle-cards"
                  className="cursor-pointer text-sm leading-none font-medium"
                >
                  Shuffle cards
                </Label>
                <p className="text-xs text-muted-foreground">
                  Randomize the order of cards
                </p>
              </div>
              <Select
                value={shuffleOverride}
                onValueChange={(v) => handleShuffleOverrideChange(v as OverrideValue)}
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
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
