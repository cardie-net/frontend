"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { getDeckColorClass } from "@/lib/decks"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardAction,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Pencil, BookOpen, MoreVertical, Share2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Deck, SRSDeckCounts } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"

import { useDraggable } from "@dnd-kit/core"

interface DeckCardProps {
  deck: Deck
  username?: string
  srsCounts?: SRSDeckCounts
  onShare: (deck: Deck) => void
  onDelete: (deckId: string) => void
}

export function DeckCard({
  deck,
  username,
  srsCounts,
  onShare,
  onDelete,
}: DeckCardProps) {
  const draggableId = `deck-drag-${deck.id}`
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: draggableId,
      data: { type: "deck", item: deck },
    })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
      }
    : undefined

  const hasCounts =
    srsCounts &&
    (srsCounts.new_count > 0 ||
      srsCounts.learning_count > 0 ||
      srsCounts.review_count > 0)
  const isDone = srsCounts && !hasCounts

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card
        className={cn(
          "relative flex flex-col transition-all",
          getDeckColorClass(deck.properties?.color),
          isDragging && "opacity-50"
        )}
      >
      <CardHeader>
        <CardTitle className="pr-8">{deck.name}</CardTitle>
        <CardAction>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" className="-mr-2 h-8 w-8" />
              }
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onShare(deck)}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(deck.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardAction>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="mb-2 text-sm text-muted-foreground capitalize">
          {deck.privacy} Deck
        </p>

        {srsCounts && (
          <div className="flex flex-wrap gap-2">
            {srsCounts.new_count > 0 && (
              <Badge className="bg-blue-500 text-white hover:bg-blue-600">
                {srsCounts.new_count} New
              </Badge>
            )}
            {srsCounts.learning_count > 0 && (
              <Badge className="bg-orange-500 text-white hover:bg-orange-600">
                {srsCounts.learning_count} Learn
              </Badge>
            )}
            {srsCounts.review_count > 0 && (
              <Badge className="bg-green-500 text-white hover:bg-green-600">
                {srsCounts.review_count} Review
              </Badge>
            )}
            {isDone && (
              <Badge
                variant="outline"
                className="border-muted-foreground/30 text-muted-foreground"
              >
                <Check className="mr-1 h-3 w-3" /> Done
              </Badge>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2 pt-4">
        <Link href={`/${username}/${deck.slug}`} className="flex-1">
          <Button className="w-full" variant="default">
            <BookOpen className="mr-2 h-4 w-4" /> Learn
          </Button>
        </Link>
        <Link href={`/${username}/${deck.slug}?edit=true`} className="flex-1">
          <Button className="w-full" variant="outline">
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </Button>
        </Link>
      </CardFooter>
    </Card>
    </div>
  )
}
