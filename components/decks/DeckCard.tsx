"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { getDeckColorClass, getDeckColorStyle } from "@/lib/decks"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, MoreVertical, Share2, Globe, Lock, EyeOff, Move, Pencil } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Deck } from "@/types"
import { Badge } from "@/components/ui/badge"
import { useDraggable } from "@dnd-kit/core"

interface DeckCardProps {
  deck: Deck
  username?: string

  onShare: (deck: Deck) => void
  onEdit?: (deck: Deck) => void
  onDelete: (deckId: string) => void
  onMove?: (deck: Deck) => void
}

export function DeckCard({
  deck,
  username,
  onShare,
  onEdit,
  onDelete,
  onMove,
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
    
  const deckHref = `/${username}/${deck.slug}`

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div className="relative block group">
        <Card
          className={cn(
            "relative w-full h-[130px] rounded-2xl border border-border/70 p-5 overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:border-primary/50 flex flex-col justify-start",
            getDeckColorClass(deck.properties?.color),
            isDragging && "opacity-50"
          )}
          style={getDeckColorStyle(deck.properties?.color)}
        >
          <Link href={deckHref} className={cn("absolute inset-0 z-10 rounded-2xl", isDragging && "pointer-events-none")} />
          {deck.properties?.cover_image_url && (
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105 pointer-events-none" 
              style={{ backgroundImage: `url(${deck.properties.cover_image_url})` }}
            />
          )}
          <div className={cn(
            "relative z-10 flex flex-col h-full pointer-events-none",
            deck.properties?.cover_image_url ? "text-white" : ""
          )}>
            <CardHeader className="p-0 flex-1 flex flex-col min-h-0 min-w-0 relative pr-6">
              <CardTitle className={cn(
                "flex items-start text-lg font-bold tracking-tight mb-2 transition-colors whitespace-pre-wrap break-words shrink-0",
                deck.properties?.cover_image_url ? "text-white group-hover:text-white/90 bg-black/40 backdrop-blur-md px-3 py-2 rounded-xl self-start" : "group-hover:text-primary"
              )}>
                {deck.cards_count !== undefined && (
                  <Badge 
                    variant={deck.properties?.cover_image_url ? "outline" : "secondary"}
                    className={cn(
                      "mr-2 mt-0.5 pointer-events-none shrink-0",
                      deck.properties?.cover_image_url ? "border-white/30 text-white/90" : ""
                    )}
                  >
                    {deck.cards_count}
                  </Badge>
                )}
                <span className="leading-tight break-all">{deck.name}</span>
              </CardTitle>
              {deck.properties?.description && !deck.properties?.cover_image_url && (
                <CardDescription className="text-xs leading-relaxed break-all line-clamp-2 text-muted-foreground">
                  {deck.properties.description}
                </CardDescription>
              )}
            </CardHeader>
          </div>
          
          <div className="absolute top-2 right-2 z-20">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn(
                      "h-8 w-8 rounded-xl",
                      deck.properties?.cover_image_url ? "text-white hover:bg-white/20" : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                    )}
                  />
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
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(deck)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onMove && (
                  <DropdownMenuItem onClick={() => onMove(deck)}>
                    <Move className="mr-2 h-4 w-4" />
                    Move
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => onDelete(deck.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className={cn(
            "absolute bottom-4 right-4 z-20 transition-colors flex items-center gap-2 pointer-events-none",
            deck.properties?.cover_image_url ? "text-white/60 group-hover:text-white/90" : "text-muted-foreground/60 group-hover:text-muted-foreground"
          )}>
            {deck.privacy === "private" && <Lock className="w-4 h-4" />}
            {deck.privacy === "unlisted" && <EyeOff className="w-4 h-4" />}
            {deck.privacy === "public" && <Globe className="w-4 h-4" />}
          </div>
        </Card>
      </div>
    </div>
  )
}
