"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/AuthContext"
import { Button } from "@/components/ui/button"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, FolderPlus, Folder as FolderIcon, Pencil, Trash2 } from "lucide-react"
import { Deck, Folder } from "@/types"
import { CreateDeckDialog } from "@/components/decks/CreateDeckDialog"
import { ShareDeckDialog } from "@/components/decks/ShareDeckDialog"
import { DeckCard } from "@/components/decks/DeckCard"
import { FolderCard } from "@/components/folders/FolderCard"
import { CreateFolderDialog } from "@/components/folders/CreateFolderDialog"
import { EditFolderDialog } from "@/components/folders/EditFolderDialog"
import { useDeleteDeck, useUpdateDeck } from "@/hooks/useDecks"
import {
  useUserItems,
  useFolderItems,
  useFolder,
  useUpdateFolder,
  useDeleteFolder,
} from "@/hooks/useFolders"
import { useSRSCounts } from "@/hooks/useSRSCounts"
import { getDeckColorClass } from "@/lib/decks"
import { cn } from "@/lib/utils"
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"

export default function FolderPage() {
  const params = useParams<{ folderId: string }>()
  const folderId = params.folderId
  const router = useRouter()

  const { user } = useAuth()

  const { data: folderData, error: folderError } = useFolder(folderId)
  const { data: userItems = [] } = useUserItems()
  const {
    data: folderItems = [],
    error: folderItemsError,
  } = useFolderItems(folderId)
  const { data: srsCountsData } = useSRSCounts()

  const updateDeck = useUpdateDeck()
  const deleteDeck = useDeleteDeck()
  const updateFolder = useUpdateFolder()
  const deleteFolder = useDeleteFolder()

  const currentFolder =
    folderData ||
    userItems.find(
      (item): item is Folder => item.id === folderId && item.type === "folder"
    )

  const [isCreateDeckOpen, setIsCreateDeckOpen] = useState(false)
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false)
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null)
  const [shareDeckTarget, setShareDeckTarget] = useState<Deck | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const childFolders = folderItems.filter(
    (item): item is Folder => item.type === "folder" && item.parent_id === folderId
  )
  const childDecks = folderItems.filter(
    (item): item is Deck => item.type === "deck" && item.folder_id === folderId
  )

  const handleDeleteDeck = (deckId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this deck? All cards will be lost."
      )
    )
      return
    deleteDeck.mutate(deckId)
  }

  const handleDeleteSubFolder = (subFolderId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this folder and all its contents?"
      )
    )
      return
    deleteFolder.mutate(subFolderId)
  }

  const handleDeleteCurrentFolder = () => {
    if (
      !confirm(
        "Are you sure you want to delete this folder and all its contents?"
      )
    )
      return
    deleteFolder.mutate(folderId, {
      onSuccess: () => {
        router.push(
          currentFolder?.parent_id
            ? `/folders/${currentFolder.parent_id}`
            : "/decks"
        )
      },
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const activeData = active.data.current
    const overData = over.data.current

    if (!activeData || !overData) return

    if (overData.type === "folder-target" && overData.folder) {
      const targetFolderId = overData.folder.id

      if (activeData.type === "deck" && activeData.item) {
        const draggedDeck = activeData.item as Deck
        if (draggedDeck.folder_id !== targetFolderId) {
          updateDeck.mutate({
            deckId: draggedDeck.id,
            folderId: targetFolderId,
          })
        }
      } else if (activeData.type === "folder" && activeData.item) {
        const draggedFolder = activeData.item as Folder
        if (
          draggedFolder.id !== targetFolderId &&
          draggedFolder.parent_id !== targetFolderId
        ) {
          updateFolder.mutate({
            folderId: draggedFolder.id,
            parentId: targetFolderId,
          })
        }
      }
    }
  }

  const isOwner = !!(
    user &&
    currentFolder &&
    user.id === currentFolder.user_id &&
    !user.is_guest
  )

  const backHref = currentFolder?.parent_id
    ? `/folders/${currentFolder.parent_id}`
    : "/decks"

  const totalItems = childFolders.length + childDecks.length

  return (
    <div className="container mx-auto max-w-5xl p-6">
      {/* Header & Navigation */}
      <div className="mb-6">
        <Link
          href={backHref}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {currentFolder?.parent_id ? "Back to Parent Folder" : "Back to Decks"}
        </Link>

        {currentFolder?.properties?.cover_image_url && (
          <div className="mb-6 rounded-2xl overflow-hidden aspect-[3/1] max-h-64 w-full">
            <img 
              src={currentFolder.properties.cover_image_url} 
              alt={`${currentFolder.name} cover`}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg border bg-muted/30",
                getDeckColorClass(currentFolder?.properties?.color)
              )}
            >
              <FolderIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">
                  {currentFolder?.name || "Folder"}
                </h1>
                <Badge variant="outline" className="capitalize">
                  {currentFolder?.privacy || "private"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {totalItems} {totalItems === 1 ? "item" : "items"}
              </p>
              {currentFolder?.properties?.description && (
                <p className="mt-2 text-sm text-foreground/90 whitespace-pre-wrap">
                  {currentFolder.properties.description}
                </p>
              )}
            </div>
          </div>

          {isOwner && (
            <div className="flex flex-wrap items-center gap-2">
              {currentFolder && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingFolder(currentFolder)}
                  >
                    <Pencil className="mr-1.5 h-4 w-4" /> Edit Folder
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteCurrentFolder}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="mr-1.5 h-4 w-4" /> Delete Folder
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreateFolderOpen(true)}
              >
                <FolderPlus className="mr-1.5 h-4 w-4" /> New Folder
              </Button>
              <Button size="sm" onClick={() => setIsCreateDeckOpen(true)}>
                <Plus className="mr-1.5 h-4 w-4" /> New Deck
              </Button>
            </div>
          )}
        </div>
      </div>

      {(folderError || folderItemsError) && (
        <Alert variant="destructive" className="mb-6">
          {folderError?.message || folderItemsError?.message}
        </Alert>
      )}

      {/* Items Grid */}
      {totalItems === 0 ? (
        <div className="rounded-lg border bg-muted/20 p-12 text-center">
          <p className="mb-4 text-muted-foreground">
            This folder is empty.
          </p>
          {isOwner && (
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => setIsCreateFolderOpen(true)}
                variant="outline"
              >
                Create a subfolder
              </Button>
              <Button onClick={() => setIsCreateDeckOpen(true)}>
                Create a deck
              </Button>
            </div>
          )}
        </div>
      ) : (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {childFolders.map((folder) => {
              const count = folderItems.filter(
                (i) =>
                  (i.type === "folder" && i.parent_id === folder.id) ||
                  (i.type === "deck" && i.folder_id === folder.id)
              ).length

              return (
                <FolderCard
                  key={folder.id}
                  folder={folder}
                  itemCount={count}
                  isOwner={isOwner}
                  onEdit={setEditingFolder}
                  onDelete={handleDeleteSubFolder}
                />
              )
            })}

            {childDecks.map((deck) => (
              <DeckCard
                key={deck.id}
                deck={deck}
                username={user?.username}
                srsCounts={srsCountsData?.[deck.id]}
                onShare={setShareDeckTarget}
                onDelete={handleDeleteDeck}
              />
            ))}
          </div>
        </DndContext>
      )}

      <CreateDeckDialog
        open={isCreateDeckOpen}
        onOpenChange={setIsCreateDeckOpen}
        folderId={folderId}
      />

      <CreateFolderDialog
        open={isCreateFolderOpen}
        onOpenChange={setIsCreateFolderOpen}
        parentId={folderId}
      />

      <EditFolderDialog
        folder={editingFolder}
        onClose={() => setEditingFolder(null)}
      />

      <ShareDeckDialog
        key={shareDeckTarget?.id ?? "closed"}
        deck={shareDeckTarget}
        onClose={() => setShareDeckTarget(null)}
      />
    </div>
  )
}
