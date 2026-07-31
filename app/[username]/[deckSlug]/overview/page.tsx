'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, BarChart3, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';
import { Flashcard, type FlashCardData } from '@/components/Flashcard';
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Progress } from "@/components/ui/progress";

interface Deck {
  id: string;
  name: string;
  slug: string;
  user_id: string;
}

export default function OverviewPage() {
  const params = useParams();
  const username = params.username as string;
  const deckSlug = params.deckSlug as string;

  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<FlashCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch deck by username and slug
        const deckRes = await apiFetch(`/api/v1/users/profile/${username}/decks/${deckSlug}`);
        if (!deckRes.ok) {
          if (deckRes.status === 404) setError('Deck not found');
          else if (deckRes.status === 403) setError('You do not have permission to view this deck');
          else setError('Failed to load deck');
          return;
        }
        const deckData = await deckRes.json();
        setDeck(deckData);

        // Fetch cards
        const cardsRes = await apiFetch(`/api/v1/decks/${deckData.id}/cards`);
        if (cardsRes.ok) {
          const cardsData = await cardsRes.json();
          setCards(cardsData.sort((a: FlashCardData, b: FlashCardData) => a.order - b.order));
        }
      } catch {
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (username && deckSlug) fetchData();
  }, [username, deckSlug]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-5xl flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !deck) {
    return (
      <div className="container mx-auto p-6 max-w-5xl flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
          <h2 className="font-bold text-2xl mb-4">{error || 'Deck not found'}</h2>
          <Link href={`/${username}/${deckSlug}`}>
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to deck
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-6 flex justify-between items-center">
        <Link href={`/${username}/${deckSlug}`}>
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Deck
          </Button>
        </Link>
      </div>

      <div className="flex flex-col items-center justify-center mt-8">
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
              <Progress value={count > 0 ? (current / count) * 100 : 0} className="h-2" />
              <div className="text-center mt-3 text-sm font-medium text-muted-foreground">
                Card {current} of {count}
              </div>
            </div>
            
            <div className="text-center mt-2 text-xs text-muted-foreground">
              Click a card to flip it over
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground p-8 border rounded-lg w-full max-w-xl">
            <p>No cards in this deck yet.</p>
            <Link href={`/${username}/${deckSlug}`}>
              <Button variant="link" className="mt-2">Go back to add cards</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
