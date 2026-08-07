"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, AlertCircle, Loader2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { useDeck } from "@/hooks/useDecks"
import { useCards } from "@/hooks/useCards"

export default function OverviewPage() {
  const params = useParams<{ username: string; slug: string }>()
  const username = params.username
  const slug = params.slug

  const {
    data: deck,
    isLoading: deckLoading,
    error,
  } = useDeck(username, slug)
  const { data: cards = [], isLoading: cardsLoading } = useCards(deck?.id)

  const loading = deckLoading || (!!deck && cardsLoading)

  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!api) return

    const update = () => {
      setCount(api.scrollSnapList().length)
      setCurrent(api.selectedScrollSnap() + 1)
    }

    api.on("select", update)
    api.on("reInit", update)
    // Defer the initial sync: the carousel has already initialized before this
    // effect runs, and calling setState synchronously here is flagged by
    // react-hooks/set-state-in-effect.
    const id = window.setTimeout(update, 0)

    return () => {
      window.clearTimeout(id)
      api.off("select", update)
      api.off("reInit", update)
    }
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
    <div className="container mx-auto flex min-h-[calc(100vh-64px)] max-w-4xl flex-col px-4 py-8 sm:px-10 sm:py-16 space-y-8">
      <div className="flex flex-col">
        <div className="flex justify-start sm:justify-between gap-4 items-center">
          <div className="hidden sm:flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-sm shrink-0">
              <Eye className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">Overview</h1>
          </div>

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
        </div>
      </div>

      <div className="mt-4 sm:mt-8 flex flex-1 flex-col items-center justify-center min-h-0">
        {cards.length > 0 ? (
          <div className="w-full flex flex-col flex-1 sm:flex-none min-h-0">
            <Carousel setApi={setApi} className="w-full flex-1 sm:flex-none flex flex-col min-h-0">
              <CarouselContent className="flex-1 sm:flex-none min-h-0">
                {cards.map((card) => (
                  <CarouselItem key={card.id} className="flex flex-col min-h-0">
                    <div className="p-1 flex-1 sm:flex-none flex flex-col min-h-0">
                      <Flashcard card={card} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>

            <div className="mt-8 px-8">
              <Progress
                value={count > 0 ? (current / count) * 100 : 0}
                className="h-2"
              />
              <div className="mt-3 text-center text-sm font-medium text-muted-foreground">
                Card {current} of {count}
              </div>
            </div>

            <div className="mt-2 text-center text-xs text-muted-foreground">
              Click a card to flip it over
            </div>
          </div>
        ) : (
          <div className="w-full max-w-xl rounded-lg border p-8 text-center text-muted-foreground">
            <p>No cards in this deck yet.</p>
            <Link href={`/${username}/${slug}`}>
              <Button variant="link" className="mt-2">
                Go back to add cards
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
