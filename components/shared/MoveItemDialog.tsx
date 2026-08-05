"use client"

import { useState, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useUserItems, useUpdateFolder } from "@/hooks/useFolders"
import { useUpdateDeck } from "@/hooks/useDecks"
import { Folder } from "@/types"
import { Folder as FolderIcon, LayoutDashboard, Check, ChevronRight, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface MoveTarget {
  id: string
  type: "deck" | "folder"
  name: string
  currentParentId: string | null
}

interface MoveItemDialogProps {
  item: MoveTarget | null
  onClose: () => void
}

export function MoveItemDialog({ item, onClose }: MoveItemDialogProps) {
  const { data: items = [], isLoading } = useUserItems()
  const updateDeck = useUpdateDeck()
  const updateFolder = useUpdateFolder()
  
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [prevItemId, setPrevItemId] = useState<string | null>(null)

  const currentItemId = item?.id ?? null
  if (currentItemId !== prevItemId) {
    setPrevItemId(currentItemId)
    setSelectedFolderId(item?.currentParentId ?? null)
    setExpandedFolders(new Set())
  }

  const folders = useMemo(() => items.filter((i): i is Folder => i.type === "folder"), [items])

  const validFolders = useMemo(() => {
    if (!item) return []

    const isDescendant = (potentialParentId: string, folderId: string): boolean => {
      if (potentialParentId === folderId) return true
      const parent = folders.find((f) => f.id === potentialParentId)
      if (!parent || !parent.parent_id) return false
      return isDescendant(parent.parent_id, folderId)
    }

    return folders.filter((f) => {
      if (item.type !== "folder") return true
      return !isDescendant(f.id, item.id)
    })
  }, [folders, item])

  const toggleExpand = (e: React.MouseEvent, folderId: string) => {
    e.stopPropagation()
    setExpandedFolders(prev => {
      const next = new Set(prev)
      if (next.has(folderId)) {
        next.delete(folderId)
      } else {
        next.add(folderId)
      }
      return next
    })
  }

  const renderFolderTree = (parentId: string | null, depth: number = 0) => {
    const children = validFolders.filter(f => f.parent_id === parentId)
    if (children.length === 0) return null

    return children.sort((a, b) => a.name.localeCompare(b.name)).map(folder => {
      const hasChildren = validFolders.some(f => f.parent_id === folder.id)
      const isExpanded = expandedFolders.has(folder.id)
      
      return (
        <div key={folder.id} className="w-full">
          <button
            onClick={() => setSelectedFolderId(folder.id)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
              selectedFolderId === folder.id
                ? "bg-primary/10 text-primary font-medium"
                : "hover:bg-muted text-foreground"
            )}
            style={{ paddingLeft: `${depth * 16 + 12}px` }}
          >
            <div className="flex items-center gap-2 truncate">
              {hasChildren ? (
                <div 
                  className="w-5 h-5 flex items-center justify-center -ml-1 rounded hover:bg-black/5 dark:hover:bg-white/10 shrink-0 cursor-pointer"
                  onClick={(e) => toggleExpand(e, folder.id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              ) : (
                <div className="w-5 h-5 shrink-0 -ml-1" />
              )}
              <FolderIcon className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="truncate">{folder.name}</span>
            </div>
            {selectedFolderId === folder.id && (
              <Check className="w-4 h-4 shrink-0 ml-2" />
            )}
          </button>
          
          {hasChildren && isExpanded && (
            <div className="mt-0.5">
              {renderFolderTree(folder.id, depth + 1)}
            </div>
          )}
        </div>
      )
    })
  }

  const isMoving = updateDeck.isPending || updateFolder.isPending

  const handleMove = () => {
    if (!item) return
    
    // Don't do anything if it hasn't moved
    if (selectedFolderId === item.currentParentId) {
      onClose()
      return
    }

    if (item.type === "deck") {
      updateDeck.mutate(
        { deckId: item.id, folderId: selectedFolderId },
        { onSuccess: onClose }
      )
    } else {
      updateFolder.mutate(
        { folderId: item.id, parentId: selectedFolderId },
        { onSuccess: onClose }
      )
    }
  }

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle>Move {item?.type === "deck" ? "Deck" : "Folder"}</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            Select a destination for <strong>{item?.name}</strong>.
          </p>

          {isLoading ? (
            <div className="flex justify-center p-4 text-muted-foreground">
              Loading folders...
            </div>
          ) : (
            <div className="max-h-[250px] overflow-y-auto pr-2 border rounded-xl p-2 bg-muted/20">
              <div className="space-y-0.5">
                <button
                  onClick={() => setSelectedFolderId(null)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors",
                    selectedFolderId === null
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-muted text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                    Root (Top Level)
                  </div>
                  {selectedFolderId === null && <Check className="w-4 h-4" />}
                </button>
                
                <div className="mt-2 space-y-0.5">
                  {renderFolderTree(null, 0)}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isMoving}>
            Cancel
          </Button>
          <Button onClick={handleMove} disabled={isMoving}>
            {isMoving ? "Moving..." : "Move"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
