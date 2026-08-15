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
  Pencil,
  Folder as FolderIcon,
  MoreVertical,
  Globe,
  Lock,
  EyeOff,
  Move,
  Share2,
  Star,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Folder } from '@/types'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/AuthContext'
import { useStarFolder, useUnstarFolder } from '@/hooks/useCommunity'

interface FolderCardProps {
  folder: Folder
  username?: string
  isOwner?: boolean
  onShare?: (folder: Folder) => void
  onEdit?: (folder: Folder) => void
  onDelete?: (folderId: string) => void
  onMove?: (folder: Folder) => void
}

export function FolderCard({
  folder,
  username,
  isOwner = true,
  onShare,
  onEdit,
  onDelete,
  onMove,
}: FolderCardProps) {
  const router = useRouter()
  const { user } = useAuth()

  const starFolder = useStarFolder()
  const unstarFolder = useUnstarFolder()

  const [isStarred, setIsStarred] = useState(folder.is_starred ?? false)
  const [starsCount, setStarsCount] = useState(folder.stars_count ?? 0)
  const [isStarPending, setIsStarPending] = useState(false)

  const ownerUsername = folder.owner?.username || username
  const folderHref =
    ownerUsername && folder.slug
      ? `/${ownerUsername}/${folder.slug}`
      : `/${ownerUsername || 'user'}/${folder.slug || folder.id}`

  const droppableId = `folder-drop-${folder.id}`
  const draggableId = `folder-drag-${folder.id}`

  const { isOver, setNodeRef: setDropRef } = useDroppable({
    id: droppableId,
    data: { type: 'folder-target', folder },
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
    data: { type: 'folder', item: folder },
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

  return (
    <div ref={setRef} style={style} {...attributes} {...listeners}>
      <div className="relative block group/folder">
        <div className="relative w-full h-[130px]">
          {/* Stacked card 2 (back) */}
          <div className="absolute inset-0 rounded-2xl border border-border/40 bg-card/40 translate-x-2 translate-y-2 transition-transform duration-300 group-hover/folder:translate-x-3 group-hover/folder:translate-y-3 z-0" />
          {/* Stacked card 1 (middle) */}
          <div className="absolute inset-0 rounded-2xl border border-border/50 bg-card/60 translate-x-1 translate-y-1 transition-transform duration-300 group-hover/folder:translate-x-1.5 group-hover/folder:translate-y-1.5 z-0" />

          <Card
            className={cn(
              'absolute inset-0 rounded-2xl border border-border/70 p-5 overflow-hidden transition-all duration-300 group-hover/folder:-translate-y-1 group-hover/folder:-translate-x-1 group-hover/folder:shadow-lg group-hover/folder:border-primary/50 flex flex-col justify-start z-10 bg-card',
              getDeckColorClass(folder.properties?.color),
              isOver && 'ring-2 ring-primary ring-offset-2 bg-accent/20',
              isDragging && 'opacity-50'
            )}
            style={getDeckColorStyle(folder.properties?.color)}
          >
            <Link
              href={folderHref}
              className={cn(
                'absolute inset-0 z-10 rounded-2xl',
                isDragging && 'pointer-events-none'
              )}
            />
            {folder.properties?.cover_image_url && (
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover/folder:scale-105 pointer-events-none"
                style={{
                  backgroundImage: `url(${folder.properties.cover_image_url})`,
                }}
              />
            )}
            <div
              className={cn(
                'relative z-10 flex flex-col h-full pointer-events-none',
                folder.properties?.cover_image_url ? 'text-white' : ''
              )}
            >
              <CardHeader className="p-0 flex-1 flex flex-col min-h-0 min-w-0 relative pr-16">
                <CardTitle
                  className={cn(
                    'flex items-start text-lg font-bold tracking-tight mb-2 transition-colors whitespace-pre-wrap break-words shrink-0',
                    folder.properties?.cover_image_url
                      ? 'text-white group-hover/folder:text-white/90 bg-black/40 backdrop-blur-md px-3 py-2 rounded-xl self-start'
                      : 'group-hover/folder:text-primary'
                  )}
                >
                  <Badge
                    variant={
                      folder.properties?.cover_image_url
                        ? 'outline'
                        : 'secondary'
                    }
                    className={cn(
                      'mr-2 mt-0.5 pointer-events-none shrink-0 px-1.5 py-0.5',
                      folder.properties?.cover_image_url
                        ? 'border-white/30 text-white/90'
                        : ''
                    )}
                  >
                    <FolderIcon className="w-3 h-3 mr-1" />
                    <span>{folder.decks_count ?? 0}</span>
                  </Badge>
                  <span className="leading-tight break-all">{folder.name}</span>
                </CardTitle>
                {folder.properties?.description &&
                  !folder.properties?.cover_image_url && (
                    <CardDescription className="text-xs leading-relaxed break-all line-clamp-2 text-muted-foreground">
                      {folder.properties.description}
                    </CardDescription>
                  )}
              </CardHeader>
            </div>

            {/* Top Right: 3-dots menu for owners, or Star Counter for favorited/non-owner items */}
            <div className="absolute top-2 right-2 z-20">
              {isOwner ? (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          'h-8 w-8 rounded-xl',
                          folder.properties?.cover_image_url
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
                      <DropdownMenuItem onClick={() => onShare(folder)}>
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                      </DropdownMenuItem>
                    )}
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(folder)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {onMove && (
                      <DropdownMenuItem onClick={() => onMove(folder)}>
                        <Move className="mr-2 h-4 w-4" />
                        Move
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem
                        onClick={() => onDelete(folder.id)}
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
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer shadow-sm',
                    folder.properties?.cover_image_url
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
            {!isOwner && folder.owner && (
              <div className="absolute bottom-3 left-4 z-20 pointer-events-auto">
                {folder.owner.is_guest ? (
                  <div
                    className={cn(
                      'inline-flex items-center gap-1.5 text-xs rounded-lg py-0.5 px-1 -ml-1 select-none cursor-default',
                      folder.properties?.cover_image_url
                        ? 'text-white/80 bg-black/40 backdrop-blur-sm px-2 py-1'
                        : 'text-muted-foreground'
                    )}
                  >
                    <Avatar className="w-4 h-4 rounded-full border border-border/50">
                      <AvatarFallback className="text-[8px] bg-muted text-muted-foreground font-semibold">
                        G
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">Guest</span>
                  </div>
                ) : (
                  <Link
                    href={`/${folder.owner.username}`}
                    onClick={(e) => e.stopPropagation()}
                    className={cn(
                      'inline-flex items-center gap-1.5 text-xs transition-colors rounded-lg py-0.5 px-1 -ml-1 group/author hover:underline',
                      folder.properties?.cover_image_url
                        ? 'text-white/90 bg-black/40 backdrop-blur-sm px-2 py-1'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Avatar className="w-4 h-4 rounded-full border border-border/50">
                      <AvatarImage
                        src={folder.owner.avatar_url}
                        alt={folder.owner.display_name}
                      />
                      <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
                        {folder.owner.display_name?.slice(0, 2).toUpperCase() ||
                          '??'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate max-w-[130px] font-medium">
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
                  'absolute bottom-4 right-4 z-20 transition-colors flex items-center gap-2 pointer-events-none',
                  folder.properties?.cover_image_url
                    ? 'text-white/60 group-hover/folder:text-white/90'
                    : 'text-muted-foreground/60 group-hover/folder:text-muted-foreground'
                )}
              >
                {folder.privacy === 'private' && <Lock className="w-4 h-4" />}
                {folder.privacy === 'unlisted' && <EyeOff className="w-4 h-4" />}
                {folder.privacy === 'public' && <Globe className="w-4 h-4" />}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
