"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react"
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
  const params = useParams<{ username: string; deckSlug: string }>()
  const username = params.username
  const deckSlug = params.deckSlug

  const {
    data: deck,
    isLoading: deckLoading,
    error,
  } = useDeck(username, deckSlug)
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
          <Link href={`/${username}/${deckSlug}`}>
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
    <div className="container mx-auto max-w-5xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <Link href={`/${username}/${deckSlug}`}>
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Deck
          </Button>
        </Link>
      </div>

      <div className="mt-8 flex flex-col items-center justify-center">
        {cards.length > 0 ? (
          <div className="w-full max-w-xl px-12">
            <Carousel setApi={setApi} className="w-full">
              <CarouselContent>
                {cards.map((card) => (
                  <CarouselItem key={card.id}>
                    <div className="p-1">
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
            <Link href={`/${username}/${deckSlug}`}>
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
