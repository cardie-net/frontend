'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getDeckColorClass, getDeckColorStyle } from '@/lib/decks'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CommunityDeck } from '@/types'
import { useAuth } from '@/lib/AuthContext'
import { useStarDeck, useUnstarDeck } from '@/hooks/useCommunity'

interface CommunityDeckCardProps {
  deck: CommunityDeck
}

export function CommunityDeckCard({ deck }: CommunityDeckCardProps) {
  const router = useRouter()
  const { user } = useAuth()

  const starDeck = useStarDeck()
  const unstarDeck = useUnstarDeck()

  const [isStarred, setIsStarred] = useState(deck.is_starred ?? false)
  const [starsCount, setStarsCount] = useState(deck.stars_count ?? 0)
  const [isPending, setIsPending] = useState(false)

  const deckHref = `/${deck.owner.username}/${deck.slug}`

  const isOwner = !!(
    user &&
    !user.is_guest &&
    (deck.user_id === user.id || deck.owner?.id === user.id)
  )

  const handleToggleStar = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isOwner) return

    if (!user || user.is_guest) {
      router.push('/login')
      return
    }

    if (isPending) return
    setIsPending(true)

    const nextStarred = !isStarred
    const nextCount = nextStarred ? starsCount + 1 : Math.max(0, starsCount - 1)

    // Optimistic state
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
      // Revert on error
      setIsStarred(!nextStarred)
      setStarsCount(starsCount)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="relative block group">
      <Card
        className={cn(
          'relative w-full h-[130px] rounded-2xl border border-border/70 p-4 sm:p-5 overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:border-primary/50 flex flex-col justify-between bg-card',
          getDeckColorClass(deck.properties?.color)
        )}
        style={getDeckColorStyle(deck.properties?.color)}
      >
        <Link href={deckHref} className="absolute inset-0 z-10 rounded-2xl" />

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

        {/* Star Button (Top Right) */}
        <div className="absolute top-2.5 right-2.5 z-20">
          <button
            type="button"
            onClick={isOwner ? undefined : handleToggleStar}
            disabled={isOwner || isPending}
            title={isOwner ? 'You cannot star your own deck' : undefined}
            className={cn(
              'flex items-center gap-1.5 px-2 py-0.5 rounded-xl text-xs font-semibold transition-all duration-200 shadow-sm',
              isOwner
                ? 'cursor-default opacity-80 bg-muted/70 text-muted-foreground border border-border/60'
                : 'cursor-pointer',
              deck.properties?.cover_image_url
                ? isStarred
                  ? 'bg-amber-500/90 text-white border border-amber-400/80 shadow-md backdrop-blur-sm'
                  : 'bg-black/50 text-white/90 hover:bg-black/70 border border-white/20 backdrop-blur-sm'
                : isStarred
                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/25'
                : !isOwner && 'bg-muted/80 text-muted-foreground hover:text-foreground hover:bg-muted border border-border/60'
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
        </div>

        {/* Author Chip (Bottom Left) */}
        <div className="relative z-20 pt-2 mt-auto flex items-center justify-between pointer-events-auto max-w-[calc(100%-1rem)]">
          {deck.owner?.is_guest ? (
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
      </Card>
    </div>
  )
}
