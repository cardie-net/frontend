"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { getDeckColorClass, getDeckColorStyle } from "@/lib/decks"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Deck } from "@/types"
import { Badge } from "@/components/ui/badge"
import { useDraggable } from "@dnd-kit/core"
import { useAuth } from "@/lib/AuthContext"
import { useStarDeck, useUnstarDeck } from "@/hooks/useCommunity"
import { useCustomTheme } from "@/components/theme/custom-theme-provider"

interface DeckCardProps {
  deck: Deck
  username?: string
  isOwner?: boolean
  showStar?: boolean
  onShare?: (deck: Deck) => void
  onEdit?: (deck: Deck) => void
  onDelete?: (deckId: string) => void
  onMove?: (deck: Deck) => void
}

export function DeckCard({
  deck,
  username,
  isOwner = true,
  showStar = true,
  onShare,
  onEdit,
  onDelete,
  onMove,
}: DeckCardProps) {
  const tCommon = useTranslations("Common")
  const router = useRouter()
  const { user } = useAuth()
  const { deckDisplayMode } = useCustomTheme()

  const starDeck = useStarDeck()
  const unstarDeck = useUnstarDeck()

  const [isStarred, setIsStarred] = useState(deck.is_starred ?? false)
  const [starsCount, setStarsCount] = useState(deck.stars_count ?? 0)
  const [isStarPending, setIsStarPending] = useState(false)

  const draggableId = `deck-drag-${deck.id}`
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: draggableId,
      data: { type: "deck", item: deck },
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
      router.push("/login")
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

  if (deckDisplayMode === "line") {
    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        <div className="group relative block">
          <Card
            className={cn(
              "relative flex min-h-[46px] w-full !flex-row flex-row items-center justify-between gap-2.5 overflow-hidden rounded-2xl border border-border/70 bg-card px-3.5 py-2 transition-all duration-200 group-hover:border-primary/50 group-hover:shadow-sm sm:min-h-[50px] sm:gap-3 sm:px-4 sm:py-2.5",
              getDeckColorClass(deck.properties?.color, "left"),
              isDragging && "opacity-50"
            )}
            style={getDeckColorStyle(deck.properties?.color, "left")}
          >
            <Link
              href={deckHref}
              className={cn(
                "absolute inset-0 z-10 rounded-2xl",
                isDragging && "pointer-events-none"
              )}
            />

            {/* Left section: Badge + Title + Description */}
            <div className="pointer-events-none relative z-10 flex min-w-0 flex-1 items-center gap-2 sm:gap-2.5">
              {deck.cards_count !== undefined && (
                <Badge
                  variant="secondary"
                  className="h-5 shrink-0 px-1.5 py-0 text-[11px] font-semibold"
                >
                  {deck.cards_count}
                </Badge>
              )}

              <div className="flex min-w-0 flex-1 items-center gap-2">
                <span className="line-clamp-2 text-xs leading-snug font-bold tracking-tight [overflow-wrap:anywhere] break-words text-foreground transition-colors group-hover:text-primary sm:line-clamp-none sm:truncate sm:text-sm sm:leading-normal">
                  {deck.name}
                </span>
                {deck.properties?.description && (
                  <span className="hidden min-w-0 shrink truncate text-xs text-muted-foreground md:inline-block">
                    • {deck.properties.description}
                  </span>
                )}
              </div>
            </div>

            {/* Right section: Author + Privacy + Star / 3-dots Menu */}
            <div className="relative z-20 flex shrink-0 items-center gap-2 sm:gap-2.5">
              {/* Non-owner author */}
              {!isOwner && deck.owner && (
                <div className="pointer-events-auto hidden items-center gap-1.5 sm:inline-flex">
                  {deck.owner.is_guest ? (
                    <div className="inline-flex items-center gap-1 text-xs text-muted-foreground select-none">
                      <Avatar className="h-4 w-4 shrink-0 rounded-full border border-border/50">
                        <AvatarFallback className="bg-muted text-[8px] font-semibold text-muted-foreground">
                          G
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-[11px] font-medium">
                        {tCommon("guest")}
                      </span>
                    </div>
                  ) : (
                    <Link
                      href={`/${deck.owner.username}`}
                      onClick={(e) => e.stopPropagation()}
                      className="group/author inline-flex min-w-0 items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground hover:underline"
                    >
                      <Avatar className="h-4 w-4 shrink-0 rounded-full border border-border/50">
                        <AvatarImage
                          src={deck.owner.avatar_url}
                          alt={deck.owner.display_name}
                        />
                        <AvatarFallback className="bg-primary/10 text-[8px] text-primary">
                          {deck.owner.display_name?.slice(0, 2).toUpperCase() ||
                            "??"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="max-w-[100px] truncate text-[11px] font-medium">
                        {deck.owner.display_name || deck.owner.username}
                      </span>
                    </Link>
                  )}
                </div>
              )}

              {/* Privacy Icon for Owner */}
              {isOwner && (
                <div className="pointer-events-none flex items-center text-muted-foreground/70">
                  {deck.privacy === "private" && (
                    <Lock className="h-3.5 w-3.5" />
                  )}
                  {deck.privacy === "unlisted" && (
                    <EyeOff className="h-3.5 w-3.5" />
                  )}
                  {deck.privacy === "public" && (
                    <Globe className="h-3.5 w-3.5" />
                  )}
                </div>
              )}

              {/* Star toggle if non-owner, or 3-dots Menu if owner */}
              {isOwner ? (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary"
                      />
                    }
                  >
                    <MoreVertical className="h-3.5" />
                    <span className="sr-only">Open menu</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onShare && (
                      <DropdownMenuItem onClick={() => onShare(deck)}>
                        <Share2 className="mr-2 h-4 w-4" />
                        {tCommon("share")}
                      </DropdownMenuItem>
                    )}
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(deck)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        {tCommon("edit")}
                      </DropdownMenuItem>
                    )}
                    {onMove && (
                      <DropdownMenuItem onClick={() => onMove(deck)}>
                        <Move className="mr-2 h-4 w-4" />
                        {tCommon("move")}
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem
                        onClick={() => onDelete(deck.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {tCommon("delete")}
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : showStar ? (
                <button
                  type="button"
                  onClick={handleToggleStar}
                  disabled={isStarPending}
                  className={cn(
                    "flex cursor-pointer items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-semibold shadow-sm transition-all duration-200",
                    isStarred
                      ? "border border-amber-500/30 bg-amber-500/15 text-amber-600 hover:bg-amber-500/25 dark:text-amber-400"
                      : "border border-border/60 bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Star
                    className={cn(
                      "h-3.5 w-3.5 transition-transform duration-200",
                      isStarred
                        ? "scale-110 fill-current text-amber-500"
                        : "text-muted-foreground"
                    )}
                  />
                  <span>{starsCount}</span>
                </button>
              ) : null}
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div className="group relative block">
        <Card
          className={cn(
            "relative flex h-[130px] w-full flex-col justify-between overflow-hidden rounded-2xl border border-border/70 p-4 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/50 group-hover:shadow-lg sm:p-5",
            getDeckColorClass(deck.properties?.color),
            isDragging && "opacity-50"
          )}
          style={getDeckColorStyle(deck.properties?.color)}
        >
          <Link
            href={deckHref}
            className={cn(
              "absolute inset-0 z-10 rounded-2xl",
              isDragging && "pointer-events-none"
            )}
          />
          {deck.properties?.cover_image_url && (
            <div
              className="pointer-events-none absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
              style={{
                backgroundImage: `url(${deck.properties.cover_image_url})`,
              }}
            />
          )}
          <div
            className={cn(
              "pointer-events-none relative z-10 flex h-full min-w-0 flex-col",
              deck.properties?.cover_image_url ? "text-white" : ""
            )}
          >
            <CardHeader className="relative flex min-h-0 min-w-0 flex-1 flex-col p-0 pr-14">
              <CardTitle
                className={cn(
                  "mb-1.5 flex min-w-0 items-start text-base font-bold tracking-tight break-words transition-colors",
                  deck.properties?.cover_image_url
                    ? "max-w-full self-start rounded-xl bg-black/40 px-2.5 py-1 text-white backdrop-blur-md group-hover:text-white/90"
                    : "group-hover:text-primary"
                )}
              >
                {deck.cards_count !== undefined && (
                  <Badge
                    variant={
                      deck.properties?.cover_image_url ? "outline" : "secondary"
                    }
                    className={cn(
                      "pointer-events-none mt-0.5 mr-1.5 h-5 shrink-0 px-1.5 py-0 text-[11px]",
                      deck.properties?.cover_image_url
                        ? "border-white/30 text-white/90"
                        : ""
                    )}
                  >
                    {deck.cards_count}
                  </Badge>
                )}
                <span className="line-clamp-2 leading-snug break-all">
                  {deck.name}
                </span>
              </CardTitle>
              {deck.properties?.description &&
                !deck.properties?.cover_image_url && (
                  <CardDescription className="line-clamp-1 text-xs leading-snug break-all text-muted-foreground">
                    {deck.properties.description}
                  </CardDescription>
                )}
            </CardHeader>
          </div>

          {/* Top Right: 3-dots menu for owners, or Star Counter for favorited/non-owner items */}
          {(isOwner || showStar) && (
            <div className="absolute top-2.5 right-2.5 z-20">
              {isOwner ? (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-8 w-8 rounded-xl",
                          deck.properties?.cover_image_url
                            ? "text-white hover:bg-white/20"
                            : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
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
                        {tCommon("share")}
                      </DropdownMenuItem>
                    )}
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(deck)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        {tCommon("edit")}
                      </DropdownMenuItem>
                    )}
                    {onMove && (
                      <DropdownMenuItem onClick={() => onMove(deck)}>
                        <Move className="mr-2 h-4 w-4" />
                        {tCommon("move")}
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem
                        onClick={() => onDelete(deck.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {tCommon("delete")}
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
                    "flex cursor-pointer items-center gap-1.5 rounded-xl px-2 py-0.5 text-xs font-semibold shadow-sm transition-all duration-200",
                    deck.properties?.cover_image_url
                      ? isStarred
                        ? "border border-amber-400/80 bg-amber-500/90 text-white shadow-md backdrop-blur-sm"
                        : "border border-white/20 bg-black/50 text-white/90 backdrop-blur-sm hover:bg-black/70"
                      : isStarred
                        ? "border border-amber-500/30 bg-amber-500/15 text-amber-600 hover:bg-amber-500/25 dark:text-amber-400"
                        : "border border-border/60 bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Star
                    className={cn(
                      "h-3.5 w-3.5 transition-transform duration-200",
                      isStarred
                        ? "scale-110 fill-current text-amber-500"
                        : "text-muted-foreground"
                    )}
                  />
                  <span>{starsCount}</span>
                </button>
              )}
            </div>
          )}

          {/* Bottom-left: Creator Info if non-owner */}
          {!isOwner && deck.owner && (
            <div className="pointer-events-auto absolute bottom-3 left-4 z-20 max-w-[calc(100%-4rem)] sm:left-5">
              {deck.owner.is_guest ? (
                <div
                  className={cn(
                    "-ml-1 inline-flex max-w-full cursor-default items-center gap-1.5 rounded-lg px-1 py-0.5 text-xs select-none",
                    deck.properties?.cover_image_url
                      ? "bg-black/40 px-2 py-0.5 text-white/80 backdrop-blur-sm"
                      : "text-muted-foreground"
                  )}
                >
                  <Avatar className="h-4 w-4 shrink-0 rounded-full border border-border/50">
                    <AvatarFallback className="bg-muted text-[8px] font-semibold text-muted-foreground">
                      G
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate font-medium">
                    {tCommon("guest")}
                  </span>
                </div>
              ) : (
                <Link
                  href={`/${deck.owner.username}`}
                  onClick={(e) => e.stopPropagation()}
                  className={cn(
                    "group/author -ml-1 inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-lg px-1 py-0.5 text-xs transition-colors hover:underline",
                    deck.properties?.cover_image_url
                      ? "bg-black/40 px-2 py-0.5 text-white/90 backdrop-blur-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Avatar className="h-4 w-4 shrink-0 rounded-full border border-border/50">
                    <AvatarImage
                      src={deck.owner.avatar_url}
                      alt={deck.owner.display_name}
                    />
                    <AvatarFallback className="bg-primary/10 text-[8px] text-primary">
                      {deck.owner.display_name?.slice(0, 2).toUpperCase() ||
                        "??"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="max-w-[120px] truncate font-medium sm:max-w-[140px]">
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
                "pointer-events-none absolute right-4 bottom-3.5 z-20 flex items-center gap-2 transition-colors sm:right-5",
                deck.properties?.cover_image_url
                  ? "text-white/60 group-hover:text-white/90"
                  : "text-muted-foreground/60 group-hover:text-muted-foreground"
              )}
            >
              {deck.privacy === "private" && <Lock className="h-4 w-4" />}
              {deck.privacy === "unlisted" && <EyeOff className="h-4 w-4" />}
              {deck.privacy === "public" && <Globe className="h-4 w-4" />}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
