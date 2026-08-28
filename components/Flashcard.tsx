import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { FlashCard as FlashCardData } from "@/types"
import { CardElements } from "@/components/cards/CardElements"

interface FlashcardProps {
  card: FlashCardData
  flipped?: boolean
  onFlip?: () => void
}

export function Flashcard({ card, flipped, onFlip }: FlashcardProps) {
  const [internalIsFlipped, setInternalIsFlipped] = useState(false)
  const isFlipped = flipped !== undefined ? flipped : internalIsFlipped

  const handleClick = () => {
    if (onFlip) {
      onFlip()
    } else {
      setInternalIsFlipped(!internalIsFlipped)
    }
  }

  return (
    <div
      className="mx-auto flex min-h-[250px] w-full flex-1 cursor-pointer flex-col sm:min-h-[500px] sm:flex-none"
      style={{ perspective: "1000px" }}
      onClick={handleClick}
    >
      <div
        className="relative h-full w-full flex-1 transition-transform duration-500"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front */}
        <Card
          className="absolute inset-0 flex flex-col bg-card p-8 text-center shadow-lg transition-shadow hover:shadow-xl"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(0deg)", // Explicit 0deg helps some browsers
          }}
        >
          <CardContent className="flex min-h-0 flex-1 flex-col p-0">
            <CardElements elements={card.front} />
          </CardContent>
        </Card>

        {/* Back */}
        <Card
          className={cn(
            "absolute inset-0 flex flex-col border-primary/20 bg-card p-8 text-center shadow-lg transition-shadow hover:shadow-xl"
          )}
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <CardContent className="flex min-h-0 flex-1 flex-col p-0">
            <CardElements elements={card.back} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
