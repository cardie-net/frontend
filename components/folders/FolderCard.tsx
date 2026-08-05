"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { getDeckColorClass } from "@/lib/decks"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Pencil, Folder as FolderIcon, MoreVertical, Globe, Lock, EyeOff } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Folder } from "@/types"
import { useDraggable, useDroppable } from "@dnd-kit/core"
import { Badge } from "@/components/ui/badge"

interface FolderCardProps {
  folder: Folder
  itemCount?: number
  username?: string
  isOwner?: boolean
  onEdit?: (folder: Folder) => void
  onDelete?: (folderId: string) => void
}

export function FolderCard({
  folder,
  itemCount,
  username,
  isOwner = true,
  onEdit,
  onDelete,
}: FolderCardProps) {
  const folderHref =
    username && folder.slug
      ? `/${username}/${folder.slug}`
      : `/folders/${folder.id}`
      
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
              "absolute inset-0 rounded-2xl border border-border/70 p-5 overflow-hidden transition-all duration-300 group-hover/folder:-translate-y-1 group-hover/folder:-translate-x-1 group-hover/folder:shadow-lg group-hover/folder:border-primary/50 flex flex-col justify-start z-10 bg-card",
              getDeckColorClass(folder.properties?.color),
              isOver && "ring-2 ring-primary ring-offset-2 bg-accent/20",
              isDragging && "opacity-50"
            )}
          >
            <Link href={folderHref} className="absolute inset-0 z-10 rounded-2xl" />
            {folder.properties?.cover_image_url && (
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover/folder:scale-105 pointer-events-none" 
                style={{ backgroundImage: `url(${folder.properties.cover_image_url})` }}
              />
            )}
            <div className={cn(
              "relative z-10 flex flex-col h-full pointer-events-none",
              folder.properties?.cover_image_url ? "text-white" : ""
            )}>
              <CardHeader className="p-0 flex-1 flex flex-col min-h-0 pr-6">
                <CardTitle className={cn(
                  "flex items-start text-lg font-bold tracking-tight mb-2 transition-colors whitespace-pre-wrap break-words shrink-0",
                  folder.properties?.cover_image_url ? "text-white group-hover/folder:text-white/90 bg-black/40 backdrop-blur-md px-3 py-2 rounded-xl self-start" : "group-hover/folder:text-primary"
                )}>
                  <Badge 
                    variant={folder.properties?.cover_image_url ? "outline" : "secondary"}
                    className={cn(
                      "mr-2 mt-0.5 pointer-events-none shrink-0 px-1.5 py-0.5",
                      folder.properties?.cover_image_url ? "border-white/30 text-white/90" : ""
                    )}
                  >
                    <FolderIcon className="w-3 h-3" />
                  </Badge>
                  <span className="leading-tight">{folder.name}</span>
                </CardTitle>
                {folder.properties?.description && !folder.properties?.cover_image_url && (
                  <div className="relative flex-1 min-h-0 overflow-hidden pr-2">
                    <CardDescription className="text-xs leading-relaxed whitespace-pre-wrap break-words h-full text-muted-foreground">
                      {folder.properties.description}
                    </CardDescription>
                    <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-card to-transparent" />
                  </div>
                )}
              </CardHeader>
            </div>
            
            {isOwner && (
              <div className="absolute top-2 right-2 z-20">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={cn(
                          "h-8 w-8 rounded-xl",
                          folder.properties?.cover_image_url ? "text-white hover:bg-white/20" : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                        )}
                      />
                    }
                  >
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(folder)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Folder
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem
                        onClick={() => onDelete(folder.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Folder
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
            
            {isOwner && (
              <div className={cn(
                "absolute bottom-4 right-4 z-20 transition-colors flex items-center gap-2 pointer-events-none",
                folder.properties?.cover_image_url ? "text-white/60 group-hover/folder:text-white/90" : "text-muted-foreground/60 group-hover/folder:text-muted-foreground"
              )}>
                {folder.privacy === "private" && <Lock className="w-4 h-4" />}
                {folder.privacy === "unlisted" && <EyeOff className="w-4 h-4" />}
                {folder.privacy === "public" && <Globe className="w-4 h-4" />}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
