import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { FlashCard as FlashCardData } from '@/types';
import { CardElements } from '@/components/cards/CardElements';

interface FlashcardProps {
  card: FlashCardData;
}

export function Flashcard({ card }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="w-full max-w-lg aspect-[3/2] cursor-pointer mx-auto"
      style={{ perspective: '1000px' }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className="relative w-full h-full transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front */}
        <Card
          className="absolute inset-0 flex flex-col justify-center items-center p-8 text-center shadow-lg hover:shadow-xl transition-shadow bg-card"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(0deg)', // Explicit 0deg helps some browsers
          }}
        >
          <CardContent className="p-0">
            <CardElements elements={card.front} />
          </CardContent>
        </Card>

        {/* Back */}
        <Card
          className={cn(
            'absolute inset-0 flex flex-col justify-center items-center p-8 text-center shadow-lg hover:shadow-xl transition-shadow bg-card border-primary/20'
          )}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <CardContent className="p-0">
            <CardElements elements={card.back} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
