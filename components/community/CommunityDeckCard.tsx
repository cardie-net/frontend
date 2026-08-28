"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { getDeckColorClass, getDeckColorStyle } from "@/lib/decks"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CommunityDeck } from "@/types"
import { useAuth } from "@/lib/AuthContext"
import { useStarDeck, useUnstarDeck } from "@/hooks/useCommunity"
import { useCustomTheme } from "@/components/theme/custom-theme-provider"

interface CommunityDeckCardProps {
  deck: CommunityDeck
}

export function CommunityDeckCard({ deck }: CommunityDeckCardProps) {
  const t = useTranslations("Community")
  const tCommon = useTranslations("Common")
  const router = useRouter()
  const { user } = useAuth()
  const { deckDisplayMode } = useCustomTheme()

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
      router.push("/login")
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

  if (deckDisplayMode === "line") {
    return (
      <div className="group relative block">
        <Card
          className={cn(
            "relative flex min-h-[46px] w-full !flex-row flex-row items-center justify-between gap-2.5 overflow-hidden rounded-2xl border border-border/70 bg-card px-3.5 py-2 transition-all duration-200 group-hover:border-primary/50 group-hover:shadow-sm sm:min-h-[50px] sm:gap-3 sm:px-4 sm:py-2.5",
            getDeckColorClass(deck.properties?.color, "left")
          )}
          style={getDeckColorStyle(deck.properties?.color, "left")}
        >
          <Link href={deckHref} className="absolute inset-0 z-10 rounded-2xl" />

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

          {/* Right section: Author + Star Button */}
          <div className="pointer-events-auto relative z-20 flex shrink-0 items-center gap-2 sm:gap-2.5">
            {deck.owner && (
              <div className="hidden items-center gap-1.5 sm:inline-flex">
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

            <button
              type="button"
              onClick={isOwner ? undefined : handleToggleStar}
              disabled={isOwner || isPending}
              title={isOwner ? t("cannotStarOwn") : undefined}
              className={cn(
                "flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-semibold shadow-sm transition-all duration-200",
                isOwner
                  ? "cursor-default border border-border/60 bg-muted/70 text-muted-foreground opacity-80"
                  : "cursor-pointer",
                isStarred
                  ? "border border-amber-500/30 bg-amber-500/15 text-amber-600 hover:bg-amber-500/25 dark:text-amber-400"
                  : !isOwner &&
                      "border border-border/60 bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground"
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
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="group relative block">
      <Card
        className={cn(
          "relative flex h-[130px] w-full flex-col justify-between overflow-hidden rounded-2xl border border-border/70 bg-card p-4 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/50 group-hover:shadow-lg sm:p-5",
          getDeckColorClass(deck.properties?.color)
        )}
        style={getDeckColorStyle(deck.properties?.color)}
      >
        <Link href={deckHref} className="absolute inset-0 z-10 rounded-2xl" />

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

        {/* Star Button (Top Right) */}
        <div className="absolute top-2.5 right-2.5 z-20">
          <button
            type="button"
            onClick={isOwner ? undefined : handleToggleStar}
            disabled={isOwner || isPending}
            title={isOwner ? t("cannotStarOwn") : undefined}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-2 py-0.5 text-xs font-semibold shadow-sm transition-all duration-200",
              isOwner
                ? "cursor-default border border-border/60 bg-muted/70 text-muted-foreground opacity-80"
                : "cursor-pointer",
              deck.properties?.cover_image_url
                ? isStarred
                  ? "border border-amber-400/80 bg-amber-500/90 text-white shadow-md backdrop-blur-sm"
                  : "border border-white/20 bg-black/50 text-white/90 backdrop-blur-sm hover:bg-black/70"
                : isStarred
                  ? "border border-amber-500/30 bg-amber-500/15 text-amber-600 hover:bg-amber-500/25 dark:text-amber-400"
                  : !isOwner &&
                    "border border-border/60 bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground"
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
        </div>

        {/* Author Chip (Bottom Left) */}
        <div className="pointer-events-auto relative z-20 mt-auto flex max-w-[calc(100%-1rem)] items-center justify-between pt-2">
          {deck.owner?.is_guest ? (
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
              <span className="truncate font-medium">{tCommon("guest")}</span>
            </div>
          ) : (
            <Link
              href={`/${deck.owner.username}`}
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
                  {deck.owner.display_name?.slice(0, 2).toUpperCase() || "??"}
                </AvatarFallback>
              </Avatar>
              <span className="max-w-[120px] truncate font-medium sm:max-w-[140px]">
                {deck.owner.display_name || deck.owner.username}
              </span>
            </Link>
          )}
        </div>
      </Card>
    </div>
  )
}
