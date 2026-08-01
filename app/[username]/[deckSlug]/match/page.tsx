'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Layers, Timer, RotateCcw, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDeck } from '@/hooks/useDecks';
import { useCards } from '@/hooks/useCards';

type GridItem = {
  id: string;
  cardId: string;
  type: 'front' | 'back';
  content: string;
  matched: boolean;
};

export default function MatchPage() {
  const params = useParams();
  const username = params.username as string;
  const deckSlug = params.deckSlug as string;

  const { data: deck, isLoading: deckLoading } = useDeck(username, deckSlug);
  const { data: cards = [], isLoading: cardsLoading } = useCards(deck?.id);

  const [gameState, setGameState] = useState<'idle' | 'playing' | 'done'>('idle');
  const [gridItems, setGridItems] = useState<GridItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [mismatchedIds, setMismatchedIds] = useState<[string, string] | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startGame = useCallback(() => {
    if (!cards.length) return;

    // Select up to 10 random cards
    const shuffledCards = [...cards].sort(() => Math.random() - 0.5);
    const selectedCards = shuffledCards.slice(0, 10);

    // Create grid items
    const items: GridItem[] = [];
    selectedCards.forEach(card => {
      items.push({
        id: `${card.id}-front`,
        cardId: card.id,
        type: 'front',
        content: card.front.map(el => el.content).join(' '),
        matched: false,
      });
      items.push({
        id: `${card.id}-back`,
        cardId: card.id,
        type: 'back',
        content: card.back.map(el => el.content).join(' '),
        matched: false,
      });
    });

    // Shuffle items
    items.sort(() => Math.random() - 0.5);

    setGridItems(items);
    setGameState('playing');
    setSelectedItemId(null);
    setMismatchedIds(null);
    setElapsedTime(0);
    
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 100);
    }, 100);
  }, [cards]);

  const endGame = useCallback(() => {
    setGameState('done');
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleItemClick = (item: GridItem) => {
    if (gameState !== 'playing' || item.matched || mismatchedIds) return;
    
    if (selectedItemId === item.id) {
      setSelectedItemId(null);
      return;
    }

    if (!selectedItemId) {
      setSelectedItemId(item.id);
      return;
    }

    const selectedItem = gridItems.find(i => i.id === selectedItemId);
    if (!selectedItem) return;

    if (selectedItem.cardId === item.cardId) {
      // Match!
      setGridItems(prev => prev.map(i => 
        i.cardId === item.cardId ? { ...i, matched: true } : i
      ));
      setSelectedItemId(null);
      
      const remainingUnmatched = gridItems.filter(i => !i.matched).length;
      // We just matched 2, so if remainingUnmatched was 2, we are done
      if (remainingUnmatched === 2) {
        endGame();
      }
    } else {
      // Mismatch
      setMismatchedIds([selectedItemId, item.id]);
      setTimeout(() => {
        setMismatchedIds(null);
        setSelectedItemId(null);
      }, 500);
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    const msStr = Math.floor((ms % 1000) / 100).toString();
    if (m > 0) return `${m}:${s.toString().padStart(2, '0')}.${msStr}`;
    return `${s}.${msStr}`;
  };

  const isLoading = deckLoading || cardsLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-5xl">
        <Skeleton className="h-10 w-32 mb-6" />
        <Skeleton className="h-[60vh] w-full" />
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="container mx-auto p-6 max-w-5xl">
        <div className="mb-6">
          <Link href={`/${username}/${deckSlug}`}>
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Deck
            </Button>
          </Link>
        </div>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md text-center py-12">
            <CardContent>
              <Layers className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-xl font-semibold mb-2">No Cards Available</p>
              <p className="text-muted-foreground mb-6">Add some cards to this deck to play Match Mode.</p>
              <Link href={`/${username}/${deckSlug}`}>
                <Button>Go Back</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6 h-10">
        <Link href={`/${username}/${deckSlug}`}>
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Deck
          </Button>
        </Link>
        {(gameState === 'playing' || gameState === 'done') && (
          <div className="flex items-center gap-2 text-lg font-mono bg-muted/50 px-3 py-1.5 rounded-md text-foreground">
            <Timer className="w-4 h-4" />
            {formatTime(elapsedTime)}s
          </div>
        )}
      </div>

      <div className="flex items-center justify-center min-h-[60vh]">
        {gameState === 'idle' && (
          <Card className="w-full max-w-md text-center py-12">
            <CardHeader className="flex flex-col items-center gap-3">
              <div className="p-4 rounded-full bg-primary/10 text-primary">
                <Layers className="h-10 w-10" />
              </div>
              <CardTitle className="text-2xl font-bold">Match Mode</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-base mb-8">
                Match the front and back of the cards as quickly as possible.
                Up to 10 cards will be randomly selected.
              </p>
              <Button size="lg" className="w-full text-lg h-12" onClick={startGame}>
                <Play className="w-5 h-5 mr-2" />
                Start Game
              </Button>
            </CardContent>
          </Card>
        )}

        {gameState === 'playing' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 w-full">
            {gridItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`
                  aspect-[4/3] flex items-center justify-center p-4 text-center cursor-pointer select-none
                  rounded-xl border-2 transition-all duration-200
                  ${item.matched ? 'opacity-0 invisible' : 'opacity-100 visible'}
                  ${selectedItemId === item.id ? 'border-primary bg-primary/10 scale-[1.02]' : 'border-border bg-card hover:border-primary/50'}
                  ${mismatchedIds?.includes(item.id) ? 'border-destructive bg-destructive/10' : ''}
                `}
              >
                <div className="line-clamp-4 font-medium text-sm sm:text-base break-words w-full">
                  {item.content}
                </div>
              </div>
            ))}
          </div>
        )}

        {gameState === 'done' && (
          <Card className="w-full max-w-md text-center py-12">
            <CardHeader className="flex flex-col items-center gap-3">
              <div className="p-4 rounded-full bg-primary/10 text-primary">
                <Timer className="h-10 w-10" />
              </div>
              <CardTitle className="text-3xl font-bold">Finished!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-lg mb-2">Your time:</p>
              <p className="text-4xl font-mono font-bold text-primary mb-8">
                {formatTime(elapsedTime)}s
              </p>
              <div className="flex flex-col gap-3">
                <Button size="lg" className="w-full" onClick={startGame}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Play Again
                </Button>
                <Link href={`/${username}/${deckSlug}`} className="w-full">
                  <Button variant="outline" size="lg" className="w-full">
                    Back to Deck
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
