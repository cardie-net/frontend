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
  Pencil,
  Folder as FolderIcon,
  MoreVertical,
  Globe,
  Lock,
  EyeOff,
  Move,
  Share2,
  Star,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Folder } from "@/types"
import { Badge } from "@/components/ui/badge"
import { useDraggable, useDroppable } from "@dnd-kit/core"
import { useAuth } from "@/lib/AuthContext"
import { useStarFolder, useUnstarFolder } from "@/hooks/useCommunity"
import { useCustomTheme } from "@/components/theme/custom-theme-provider"

interface FolderCardProps {
  folder: Folder
  username?: string
  isOwner?: boolean
  showStar?: boolean
  onShare?: (folder: Folder) => void
  onEdit?: (folder: Folder) => void
  onDelete?: (folderId: string) => void
  onMove?: (folder: Folder) => void
}

export function FolderCard({
  folder,
  username,
  isOwner = true,
  showStar = true,
  onShare,
  onEdit,
  onDelete,
  onMove,
}: FolderCardProps) {
  const tCommon = useTranslations("Common")
  const router = useRouter()
  const { user } = useAuth()
  const { deckDisplayMode } = useCustomTheme()

  const starFolder = useStarFolder()
  const unstarFolder = useUnstarFolder()

  const [isStarred, setIsStarred] = useState(folder.is_starred ?? false)
  const [starsCount, setStarsCount] = useState(folder.stars_count ?? 0)
  const [isStarPending, setIsStarPending] = useState(false)

  const ownerUsername = folder.owner?.username || username
  const folderHref =
    ownerUsername && folder.slug
      ? `/${ownerUsername}/${folder.slug}`
      : `/${ownerUsername || "user"}/${folder.slug || folder.id}`

  const droppableId = `folder-drop-${folder.id}`
  const draggableId = `folder-drag-${folder.id}`

  const { isOver, setNodeRef: setDropRef } = useDroppable({
    id: droppableId,
    data: { type: "folder-target", folder },
    disabled: !isOwner,
  })

  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    transform,
    isDragging,
  } = useDraggable({
    id: draggableId,
    data: { type: "folder", item: folder },
    disabled: !isOwner,
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
      }
    : undefined

  const setRef = (node: HTMLDivElement | null) => {
    setDropRef(node)
    setDragRef(node)
  }

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
        const res = await starFolder.mutateAsync(folder.id)
        setStarsCount(res.stars_count)
        setIsStarred(res.starred)
      } else {
        const res = await unstarFolder.mutateAsync(folder.id)
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
      <div ref={setRef} style={style} {...attributes} {...listeners}>
        <div className="group/folder relative block">
          <Card
            className={cn(
              "relative flex min-h-[46px] w-full !flex-row flex-row items-center justify-between gap-2.5 overflow-hidden rounded-2xl border border-border/70 bg-card px-3.5 py-2 transition-all duration-200 group-hover/folder:border-primary/50 group-hover/folder:shadow-sm sm:min-h-[50px] sm:gap-3 sm:px-4 sm:py-2.5",
              getDeckColorClass(folder.properties?.color, "left"),
              isOver && "bg-accent/20 ring-2 ring-primary ring-offset-2",
              isDragging && "opacity-50"
            )}
            style={getDeckColorStyle(folder.properties?.color, "left")}
          >
            <Link
              href={folderHref}
              className={cn(
                "absolute inset-0 z-10 rounded-2xl",
                isDragging && "pointer-events-none"
              )}
            />

            {/* Left section: Badge + Title + Description */}
            <div className="pointer-events-none relative z-10 flex min-w-0 flex-1 items-center gap-2 sm:gap-2.5">
              <Badge
                variant="secondary"
                className="h-5 shrink-0 px-1.5 py-0 text-[11px] font-semibold"
              >
                <FolderIcon className="mr-1 h-3 w-3" />
                <span>{folder.decks_count ?? 0}</span>
              </Badge>

              <div className="flex min-w-0 flex-1 items-center gap-2">
                <span className="line-clamp-2 text-xs leading-snug font-bold tracking-tight [overflow-wrap:anywhere] break-words text-foreground transition-colors group-hover/folder:text-primary sm:line-clamp-none sm:truncate sm:text-sm sm:leading-normal">
                  {folder.name}
                </span>
                {folder.properties?.description && (
                  <span className="hidden min-w-0 shrink truncate text-xs text-muted-foreground md:inline-block">
                    • {folder.properties.description}
                  </span>
                )}
              </div>
            </div>

            {/* Right section: Author + Privacy + Star / 3-dots Menu */}
            <div className="relative z-20 flex shrink-0 items-center gap-2 sm:gap-2.5">
              {/* Non-owner author */}
              {!isOwner && folder.owner && (
                <div className="pointer-events-auto hidden items-center gap-1.5 sm:inline-flex">
                  {folder.owner.is_guest ? (
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
                      href={`/${folder.owner.username}`}
                      onClick={(e) => e.stopPropagation()}
                      className="group/author inline-flex min-w-0 items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground hover:underline"
                    >
                      <Avatar className="h-4 w-4 shrink-0 rounded-full border border-border/50">
                        <AvatarImage
                          src={folder.owner.avatar_url}
                          alt={folder.owner.display_name}
                        />
                        <AvatarFallback className="bg-primary/10 text-[8px] text-primary">
                          {folder.owner.display_name
                            ?.slice(0, 2)
                            .toUpperCase() || "??"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="max-w-[100px] truncate text-[11px] font-medium">
                        {folder.owner.display_name || folder.owner.username}
                      </span>
                    </Link>
                  )}
                </div>
              )}

              {/* Privacy Icon for Owner */}
              {isOwner && (
                <div className="pointer-events-none flex items-center text-muted-foreground/70">
                  {folder.privacy === "private" && (
                    <Lock className="h-3.5 w-3.5" />
                  )}
                  {folder.privacy === "unlisted" && (
                    <EyeOff className="h-3.5 w-3.5" />
                  )}
                  {folder.privacy === "public" && (
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
                      <DropdownMenuItem onClick={() => onShare(folder)}>
                        <Share2 className="mr-2 h-4 w-4" />
                        {tCommon("share")}
                      </DropdownMenuItem>
                    )}
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(folder)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        {tCommon("edit")}
                      </DropdownMenuItem>
                    )}
                    {onMove && (
                      <DropdownMenuItem onClick={() => onMove(folder)}>
                        <Move className="mr-2 h-4 w-4" />
                        {tCommon("move")}
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem
                        onClick={() => onDelete(folder.id)}
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
    <div ref={setRef} style={style} {...attributes} {...listeners}>
      <div className="group/folder relative block">
        <div className="relative h-[130px] w-full">
          {/* Stacked card 2 (back) */}
          <div className="absolute inset-0 z-0 translate-x-2 translate-y-2 rounded-2xl border border-border/40 bg-card/40 transition-transform duration-300 group-hover/folder:translate-x-3 group-hover/folder:translate-y-3" />
          {/* Stacked card 1 (middle) */}
          <div className="absolute inset-0 z-0 translate-x-1 translate-y-1 rounded-2xl border border-border/50 bg-card/60 transition-transform duration-300 group-hover/folder:translate-x-1.5 group-hover/folder:translate-y-1.5" />

          <Card
            className={cn(
              "absolute inset-0 z-10 flex flex-col justify-between overflow-hidden rounded-2xl border border-border/70 bg-card p-4 transition-all duration-300 group-hover/folder:-translate-x-1 group-hover/folder:-translate-y-1 group-hover/folder:border-primary/50 group-hover/folder:shadow-lg sm:p-5",
              getDeckColorClass(folder.properties?.color),
              isOver && "bg-accent/20 ring-2 ring-primary ring-offset-2",
              isDragging && "opacity-50"
            )}
            style={getDeckColorStyle(folder.properties?.color)}
          >
            <Link
              href={folderHref}
              className={cn(
                "absolute inset-0 z-10 rounded-2xl",
                isDragging && "pointer-events-none"
              )}
            />
            {folder.properties?.cover_image_url && (
              <div
                className="pointer-events-none absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover/folder:scale-105"
                style={{
                  backgroundImage: `url(${folder.properties.cover_image_url})`,
                }}
              />
            )}
            <div
              className={cn(
                "pointer-events-none relative z-10 flex h-full min-w-0 flex-col",
                folder.properties?.cover_image_url ? "text-white" : ""
              )}
            >
              <CardHeader className="relative flex min-h-0 min-w-0 flex-1 flex-col p-0 pr-14">
                <CardTitle
                  className={cn(
                    "mb-1.5 flex min-w-0 items-start text-base font-bold tracking-tight break-words transition-colors",
                    folder.properties?.cover_image_url
                      ? "max-w-full self-start rounded-xl bg-black/40 px-2.5 py-1 text-white backdrop-blur-md group-hover/folder:text-white/90"
                      : "group-hover/folder:text-primary"
                  )}
                >
                  <Badge
                    variant={
                      folder.properties?.cover_image_url
                        ? "outline"
                        : "secondary"
                    }
                    className={cn(
                      "pointer-events-none mt-0.5 mr-1.5 h-5 shrink-0 px-1.5 py-0 text-[11px]",
                      folder.properties?.cover_image_url
                        ? "border-white/30 text-white/90"
                        : ""
                    )}
                  >
                    <FolderIcon className="mr-1 h-3 w-3" />
                    <span>{folder.decks_count ?? 0}</span>
                  </Badge>
                  <span className="line-clamp-2 leading-snug break-all">
                    {folder.name}
                  </span>
                </CardTitle>
                {folder.properties?.description &&
                  !folder.properties?.cover_image_url && (
                    <CardDescription className="line-clamp-1 text-xs leading-snug break-all text-muted-foreground">
                      {folder.properties.description}
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
                            folder.properties?.cover_image_url
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
                        <DropdownMenuItem onClick={() => onShare(folder)}>
                          <Share2 className="mr-2 h-4 w-4" />
                          {tCommon("share")}
                        </DropdownMenuItem>
                      )}
                      {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(folder)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          {tCommon("edit")}
                        </DropdownMenuItem>
                      )}
                      {onMove && (
                        <DropdownMenuItem onClick={() => onMove(folder)}>
                          <Move className="mr-2 h-4 w-4" />
                          {tCommon("move")}
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <DropdownMenuItem
                          onClick={() => onDelete(folder.id)}
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
                      folder.properties?.cover_image_url
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
            {!isOwner && folder.owner && (
              <div className="pointer-events-auto absolute bottom-3 left-4 z-20 max-w-[calc(100%-4rem)] sm:left-5">
                {folder.owner.is_guest ? (
                  <div
                    className={cn(
                      "-ml-1 inline-flex max-w-full cursor-default items-center gap-1.5 rounded-lg px-1 py-0.5 text-xs select-none",
                      folder.properties?.cover_image_url
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
                    href={`/${folder.owner.username}`}
                    onClick={(e) => e.stopPropagation()}
                    className={cn(
                      "group/author -ml-1 inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-lg px-1 py-0.5 text-xs transition-colors hover:underline",
                      folder.properties?.cover_image_url
                        ? "bg-black/40 px-2 py-0.5 text-white/90 backdrop-blur-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Avatar className="h-4 w-4 shrink-0 rounded-full border border-border/50">
                      <AvatarImage
                        src={folder.owner.avatar_url}
                        alt={folder.owner.display_name}
                      />
                      <AvatarFallback className="bg-primary/10 text-[8px] text-primary">
                        {folder.owner.display_name?.slice(0, 2).toUpperCase() ||
                          "??"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="max-w-[120px] truncate font-medium sm:max-w-[140px]">
                      {folder.owner.display_name || folder.owner.username}
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
                  folder.properties?.cover_image_url
                    ? "text-white/60 group-hover/folder:text-white/90"
                    : "text-muted-foreground/60 group-hover/folder:text-muted-foreground"
                )}
              >
                {folder.privacy === "private" && <Lock className="h-4 w-4" />}
                {folder.privacy === "unlisted" && (
                  <EyeOff className="h-4 w-4" />
                )}
                {folder.privacy === "public" && <Globe className="h-4 w-4" />}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
