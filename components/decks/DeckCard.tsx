'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { getDeckColorClass, getDeckColorStyle } from '@/lib/decks'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Trash2,
  MoreVertical,
  Share2,
  Globe,
  Lock,
  EyeOff,
  Move,
  Pencil,
  Star,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Deck } from '@/types'
import { Badge } from '@/components/ui/badge'
import { useDraggable } from '@dnd-kit/core'
import { useAuth } from '@/lib/AuthContext'
import { useStarDeck, useUnstarDeck } from '@/hooks/useCommunity'

interface DeckCardProps {
  deck: Deck
  username?: string
  isOwner?: boolean
  onShare?: (deck: Deck) => void
  onEdit?: (deck: Deck) => void
  onDelete?: (deckId: string) => void
  onMove?: (deck: Deck) => void
}

export function DeckCard({
  deck,
  username,
  isOwner = true,
  onShare,
  onEdit,
  onDelete,
  onMove,
}: DeckCardProps) {
  const router = useRouter()
  const { user } = useAuth()

  const starDeck = useStarDeck()
  const unstarDeck = useUnstarDeck()

  const [isStarred, setIsStarred] = useState(deck.is_starred ?? false)
  const [starsCount, setStarsCount] = useState(deck.stars_count ?? 0)
  const [isStarPending, setIsStarPending] = useState(false)

  const draggableId = `deck-drag-${deck.id}`
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: draggableId,
      data: { type: 'deck', item: deck },
      disabled: !isOwner,
    })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
      }
    : undefined

  const ownerUsername = deck.owner?.username || username
  const deckHref = `/${ownerUsername}/${deck.slug}`

  const handleToggleStar = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user || user.is_guest) {
      router.push('/login')
      return
    }

    if (isStarPending) return
    setIsStarPending(true)

    const nextStarred = !isStarred
    const nextCount = nextStarred ? starsCount + 1 : Math.max(0, starsCount - 1)

    setIsStarred(nextStarred)
    setStarsCount(nextCount)

    try {
      if (nextStarred) {
        const res = await starDeck.mutateAsync(deck.id)
        setStarsCount(res.stars_count)
        setIsStarred(res.starred)
      } else {
        const res = await unstarDeck.mutateAsync(deck.id)
        setStarsCount(res.stars_count)
        setIsStarred(res.starred)
      }
    } catch {
      setIsStarred(!nextStarred)
      setStarsCount(starsCount)
    } finally {
      setIsStarPending(false)
    }
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div className="relative block group">
        <Card
          className={cn(
            'relative w-full h-[130px] rounded-2xl border border-border/70 p-4 sm:p-5 overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:border-primary/50 flex flex-col justify-between',
            getDeckColorClass(deck.properties?.color),
            isDragging && 'opacity-50'
          )}
          style={getDeckColorStyle(deck.properties?.color)}
        >
          <Link
            href={deckHref}
            className={cn(
              'absolute inset-0 z-10 rounded-2xl',
              isDragging && 'pointer-events-none'
            )}
          />
          {deck.properties?.cover_image_url && (
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105 pointer-events-none"
              style={{
                backgroundImage: `url(${deck.properties.cover_image_url})`,
              }}
            />
          )}
          <div
            className={cn(
              'relative z-10 flex flex-col h-full pointer-events-none min-w-0',
              deck.properties?.cover_image_url ? 'text-white' : ''
            )}
          >
            <CardHeader className="p-0 flex-1 flex flex-col min-h-0 min-w-0 relative pr-14">
              <CardTitle
                className={cn(
                  'flex items-start text-base font-bold tracking-tight mb-1.5 transition-colors break-words min-w-0',
                  deck.properties?.cover_image_url
                    ? 'text-white group-hover:text-white/90 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-xl self-start max-w-full'
                    : 'group-hover:text-primary'
                )}
              >
                {deck.cards_count !== undefined && (
                  <Badge
                    variant={
                      deck.properties?.cover_image_url ? 'outline' : 'secondary'
                    }
                    className={cn(
                      'mr-1.5 mt-0.5 pointer-events-none shrink-0 text-[11px] px-1.5 py-0 h-5',
                      deck.properties?.cover_image_url
                        ? 'border-white/30 text-white/90'
                        : ''
                    )}
                  >
                    {deck.cards_count}
                  </Badge>
                )}
                <span className="leading-snug break-all line-clamp-2">{deck.name}</span>
              </CardTitle>
              {deck.properties?.description &&
                !deck.properties?.cover_image_url && (
                  <CardDescription className="text-xs leading-snug break-all line-clamp-1 text-muted-foreground">
                    {deck.properties.description}
                  </CardDescription>
                )}
            </CardHeader>
          </div>

          {/* Top Right: 3-dots menu for owners, or Star Counter for favorited/non-owner items */}
          <div className="absolute top-2.5 right-2.5 z-20">
            {isOwner ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        'h-8 w-8 rounded-xl',
                        deck.properties?.cover_image_url
                          ? 'text-white hover:bg-white/20'
                          : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
                      )}
                    />
                  }
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onShare && (
                    <DropdownMenuItem onClick={() => onShare(deck)}>
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </DropdownMenuItem>
                  )}
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
                  {onDelete && (
                    <DropdownMenuItem
                      onClick={() => onDelete(deck.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                type="button"
                onClick={handleToggleStar}
                disabled={isStarPending}
                className={cn(
                  'flex items-center gap-1.5 px-2 py-0.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer shadow-sm',
                  deck.properties?.cover_image_url
                    ? isStarred
                      ? 'bg-amber-500/90 text-white border border-amber-400/80 shadow-md backdrop-blur-sm'
                      : 'bg-black/50 text-white/90 hover:bg-black/70 border border-white/20 backdrop-blur-sm'
                    : isStarred
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/25'
                    : 'bg-muted/80 text-muted-foreground hover:text-foreground hover:bg-muted border border-border/60'
                )}
              >
                <Star
                  className={cn(
                    'w-3.5 h-3.5 transition-transform duration-200',
                    isStarred
                      ? 'fill-current text-amber-500 scale-110'
                      : 'text-muted-foreground'
                  )}
                />
                <span>{starsCount}</span>
              </button>
            )}
          </div>

          {/* Bottom-left: Creator Info if non-owner */}
          {!isOwner && deck.owner && (
            <div className="absolute bottom-3 left-4 sm:left-5 z-20 pointer-events-auto max-w-[calc(100%-4rem)]">
              {deck.owner.is_guest ? (
                <div
                  className={cn(
                    'inline-flex items-center gap-1.5 text-xs rounded-lg py-0.5 px-1 -ml-1 select-none cursor-default max-w-full',
                    deck.properties?.cover_image_url
                      ? 'text-white/80 bg-black/40 backdrop-blur-sm px-2 py-0.5'
                      : 'text-muted-foreground'
                  )}
                >
                  <Avatar className="w-4 h-4 rounded-full border border-border/50 shrink-0">
                    <AvatarFallback className="text-[8px] bg-muted text-muted-foreground font-semibold">
                      G
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium truncate">Guest</span>
                </div>
              ) : (
                <Link
                  href={`/${deck.owner.username}`}
                  onClick={(e) => e.stopPropagation()}
                  className={cn(
                    'inline-flex items-center gap-1.5 text-xs transition-colors rounded-lg py-0.5 px-1 -ml-1 group/author hover:underline max-w-full min-w-0',
                    deck.properties?.cover_image_url
                      ? 'text-white/90 bg-black/40 backdrop-blur-sm px-2 py-0.5'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Avatar className="w-4 h-4 rounded-full border border-border/50 shrink-0">
                    <AvatarImage
                      src={deck.owner.avatar_url}
                      alt={deck.owner.display_name}
                    />
                    <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
                      {deck.owner.display_name?.slice(0, 2).toUpperCase() || '??'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate max-w-[120px] sm:max-w-[140px] font-medium">
                    {deck.owner.display_name || deck.owner.username}
                  </span>
                </Link>
              )}
            </div>
          )}

          {/* Bottom-right: Privacy Indicator for Owners */}
          {isOwner && (
            <div
              className={cn(
                'absolute bottom-3.5 right-4 sm:right-5 z-20 transition-colors flex items-center gap-2 pointer-events-none',
                deck.properties?.cover_image_url
                  ? 'text-white/60 group-hover:text-white/90'
                  : 'text-muted-foreground/60 group-hover:text-muted-foreground'
              )}
            >
              {deck.privacy === 'private' && <Lock className="w-4 h-4" />}
              {deck.privacy === 'unlisted' && <EyeOff className="w-4 h-4" />}
              {deck.privacy === 'public' && <Globe className="w-4 h-4" />}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
