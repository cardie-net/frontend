import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { FlashCard as FlashCardData } from '@/types';
import { CardElements } from '@/components/cards/CardElements';

interface FlashcardProps {
  card: FlashCardData;
  flipped?: boolean;
  onFlip?: () => void;
}

export function Flashcard({ card, flipped, onFlip }: FlashcardProps) {
  const [internalIsFlipped, setInternalIsFlipped] = useState(false);
  const isFlipped = flipped !== undefined ? flipped : internalIsFlipped;

  const handleClick = () => {
    if (onFlip) {
      onFlip();
    } else {
      setInternalIsFlipped(!internalIsFlipped);
    }
  };

  return (
    <div
      className="w-full flex-1 sm:flex-none flex flex-col min-h-[250px] sm:min-h-[500px] cursor-pointer mx-auto"
      style={{ perspective: '1000px' }}
      onClick={handleClick}
    >
      <div
        className="relative w-full h-full flex-1 transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front */}
        <Card
          className="absolute inset-0 flex flex-col p-8 text-center shadow-lg hover:shadow-xl transition-shadow bg-card"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(0deg)', // Explicit 0deg helps some browsers
          }}
        >
          <CardContent className="flex flex-col flex-1 min-h-0 p-0">
            <CardElements elements={card.front} />
          </CardContent>
        </Card>

        {/* Back */}
        <Card
          className={cn(
            'absolute inset-0 flex flex-col p-8 text-center shadow-lg hover:shadow-xl transition-shadow bg-card border-primary/20'
          )}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <CardContent className="flex flex-col flex-1 min-h-0 p-0">
            <CardElements elements={card.back} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
