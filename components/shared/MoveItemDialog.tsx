"use client"

import { useState, useMemo } from "react"
import { useTranslations } from "next-intl"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useUserItems, useUpdateFolder } from "@/hooks/useFolders"
import { useUpdateDeck } from "@/hooks/useDecks"
import { Folder } from "@/types"
import {
  Folder as FolderIcon,
  LayoutDashboard,
  Check,
  ChevronRight,
  ChevronDown,
  MoveRight,
} from "lucide-react"
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
  const t = useTranslations("MoveItem")
  const tCommon = useTranslations("Common")
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

  const folders = useMemo(
    () => items.filter((i): i is Folder => i.type === "folder"),
    [items]
  )

  const validFolders = useMemo(() => {
    if (!item) return []

    const isDescendant = (
      potentialParentId: string,
      folderId: string
    ): boolean => {
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
    setExpandedFolders((prev) => {
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
    const children = validFolders.filter((f) => f.parent_id === parentId)
    if (children.length === 0) return null

    return children
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((folder) => {
        const hasChildren = validFolders.some((f) => f.parent_id === folder.id)
        const isExpanded = expandedFolders.has(folder.id)

        return (
          <div key={folder.id} className="w-full">
            <button
              onClick={() => setSelectedFolderId(folder.id)}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                selectedFolderId === folder.id
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-foreground hover:bg-muted"
              )}
              style={{ paddingLeft: `${depth * 16 + 12}px` }}
            >
              <div className="flex items-center gap-2 truncate">
                {hasChildren ? (
                  <div
                    className="-ml-1 flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded hover:bg-black/5 dark:hover:bg-white/10"
                    onClick={(e) => toggleExpand(e, folder.id)}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                ) : (
                  <div className="-ml-1 h-5 w-5 shrink-0" />
                )}
                <FolderIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{folder.name}</span>
              </div>
              {selectedFolderId === folder.id && (
                <Check className="ml-2 h-4 w-4 shrink-0" />
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

  const itemTypeName = item?.type === "deck" ? t("deck") : t("folder")

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="rounded-2xl sm:max-w-[425px]">
        <DialogHeader className="flex flex-row items-center gap-3 space-y-0 text-left">
          <div className="rounded-2xl bg-primary/10 p-2 text-primary">
            <MoveRight className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="text-base font-semibold">
              {t("title", { type: itemTypeName })}
            </DialogTitle>
            <DialogDescription className="mt-0.5 text-xs text-muted-foreground">
              {t("description")}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="py-4">
          <p className="mb-4 text-sm text-muted-foreground">
            {t.rich("selectDestination", {
              name: item?.name || "",
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
          </p>

          {isLoading ? (
            <div className="flex justify-center p-4 text-muted-foreground">
              {t("loadingFolders")}
            </div>
          ) : (
            <div className="max-h-[250px] overflow-y-auto rounded-xl border bg-muted/20 p-2 pr-2">
              <div className="space-y-0.5">
                <button
                  onClick={() => setSelectedFolderId(null)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors",
                    selectedFolderId === null
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                    {t("root")}
                  </div>
                  {selectedFolderId === null && <Check className="h-4 w-4" />}
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
            {tCommon("cancel")}
          </Button>
          <Button onClick={handleMove} disabled={isMoving}>
            {isMoving ? t("moving") : t("move")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
