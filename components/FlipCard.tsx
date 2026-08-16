"use client"

import { useTranslations } from "next-intl"
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
  const t = useTranslations("Cards")

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
              <span className="sm:hidden">{t("clickToFlipMobile")}</span>
              <span className="hidden sm:inline-flex items-center justify-center gap-1.5">
                {t.rich("clickToFlipDesktop", {
                  space: (chunks) => <Kbd className="text-xs">{chunks}</Kbd>,
                  enter: (chunks) => <Kbd className="text-xs">{chunks}</Kbd>,
                })}
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
