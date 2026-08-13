"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Kbd } from "@/components/ui/kbd"
import { CardElements } from "@/components/cards/CardElements"
import type { CardElement } from "@/types"

interface FlipCardProps {
  front: CardElement[]
  back: CardElement[]
  flipped: boolean
  onFlip: () => void
  /**
   * Stable snapshot of the back face while un-flipping. Without it the back
   * could briefly show the *next* card's content during the flip-down
   * animation when the current card changes.
   */
  backContent?: CardElement[] | null
  /**
   * If true, clicking on the card will not flip it and the flip instructions footer will be hidden.
   */
  disableFlip?: boolean
}

/**
 * The 3D flip card shared by the learning and spaced-repetition sessions:
 * front/back markdown faces, click-to-flip, and a hint footer while upright.
 */
export function FlipCard({
  front,
  back,
  flipped,
  onFlip,
  backContent,
  disableFlip = false,
}: FlipCardProps) {
  return (
    <div className="relative flex-1 sm:flex-none flex flex-col w-full [perspective:1000px] min-h-[200px] sm:min-h-[500px]">
      <div
        className={`h-full flex-1 flex flex-col min-h-0 w-full transition-all duration-500 [transform-style:preserve-3d] ${disableFlip ? "cursor-default" : "cursor-pointer"} ${flipped ? "[transform:rotateY(180deg)]" : ""}`}
        onClick={() => {
          if (!disableFlip) {
            onFlip()
          }
        }}
      >
        {/* Front side */}
        <Card className="absolute inset-0 flex flex-col py-0 [backface-visibility:hidden]">
          <CardContent className="flex flex-col flex-1 min-h-0 p-8 text-center text-xl">
            <CardElements elements={front} />
          </CardContent>
          {!flipped && !disableFlip && (
            <div className="border-t bg-muted/20 p-4 text-center text-sm text-muted-foreground rounded-b-[min(var(--radius-4xl),24px)]">
              <span className="sm:hidden">Click anywhere on the card to flip</span>
              <span className="hidden sm:inline-flex items-center justify-center gap-1.5">
                Click anywhere on the card or press <Kbd className="text-xs">Space</Kbd> / <Kbd className="text-xs">Enter</Kbd> to flip
              </span>
            </div>
          )}
        </Card>

        {/* Back side */}
        <Card className="absolute inset-0 flex [transform:rotateY(180deg)] flex-col py-0 [backface-visibility:hidden]">
          <CardContent className="flex flex-col flex-1 min-h-0 p-8 text-center text-xl">
            <CardElements elements={backContent || back} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
