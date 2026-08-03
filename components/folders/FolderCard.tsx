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
import { Trash2, Pencil, Folder as FolderIcon, FolderOpen, MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Folder } from "@/types"
import { useDraggable, useDroppable } from "@dnd-kit/core"

interface FolderCardProps {
  folder: Folder
  itemCount?: number
  isOwner?: boolean
  onEdit?: (folder: Folder) => void
  onDelete?: (folderId: string) => void
}

export function FolderCard({
  folder,
  itemCount,
  isOwner = true,
  onEdit,
  onDelete,
}: FolderCardProps) {
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

  // Combine drag and drop refs
  const setRef = (node: HTMLDivElement | null) => {
    setDropRef(node)
    setDragRef(node)
  }

  return (
    <div ref={setRef} style={style} {...attributes} {...listeners}>
      <Card
        className={cn(
          "relative flex flex-col transition-all",
          getDeckColorClass(folder.properties?.color),
          isOver && "ring-2 ring-primary ring-offset-2 bg-accent/20",
          isDragging && "opacity-50"
        )}
      >
        <CardHeader>
          <div className="flex items-center gap-2 pr-8">
            <FolderIcon className="h-5 w-5 text-primary shrink-0" />
            <CardTitle className="truncate">{folder.name}</CardTitle>
          </div>
          {isOwner && (
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
            </CardAction>
          )}
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="mb-2 text-sm text-muted-foreground capitalize">
            {folder.privacy || "private"} Folder
          </p>
          {itemCount !== undefined && (
            <p className="text-xs text-muted-foreground">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex gap-2 pt-4">
          <Link href={`/folders/${folder.id}`} className="flex-1">
            <Button className="w-full" variant="outline">
              <FolderOpen className="mr-2 h-4 w-4" /> Open Folder
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
