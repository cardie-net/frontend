"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/AuthContext"
import { Button } from "@/components/ui/button"
import { Alert } from "@/components/ui/alert"
import { Plus, Upload, FolderPlus } from "lucide-react"
import { Deck, Folder } from "@/types"
import { CreateDeckDialog } from "@/components/decks/CreateDeckDialog"
import { DeckImportDialog } from "@/components/decks/DeckImportDialog"
import { ShareDeckDialog } from "@/components/decks/ShareDeckDialog"
import { DeckCard } from "@/components/decks/DeckCard"
import { FolderCard } from "@/components/folders/FolderCard"
import { CreateFolderDialog } from "@/components/folders/CreateFolderDialog"
import { EditFolderDialog } from "@/components/folders/EditFolderDialog"
import { useUpdateDeck, useDeleteDeck } from "@/hooks/useDecks"
import { useUserItems, useUpdateFolder, useDeleteFolder } from "@/hooks/useFolders"
import { useSRSCounts } from "@/hooks/useSRSCounts"
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"

export default function DecksPage() {
  const { user, loading: authLoading } = useAuth()

  const {
    data: items = [],
    isLoading: itemsLoading,
    error: itemsError,
  } = useUserItems()
  const { data: srsCountsData } = useSRSCounts()

  const updateDeck = useUpdateDeck()
  const deleteDeck = useDeleteDeck()
  const updateFolder = useUpdateFolder()
  const deleteFolder = useDeleteFolder()

  const [isCreateDeckOpen, setIsCreateDeckOpen] = useState(false)
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [shareDeckTarget, setShareDeckTarget] = useState<Deck | null>(null)
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const rootFolders = items.filter(
    (item): item is Folder => item.type === "folder" && !item.parent_id
  )
  const rootDecks = items.filter(
    (item): item is Deck => item.type === "deck" && !item.folder_id
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

  const handleDeleteFolder = (folderId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this folder and all its contents?"
      )
    )
      return
    deleteFolder.mutate(folderId)
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

  if (authLoading || itemsLoading) {
    return <div className="p-8">Loading items...</div>
  }

  if (!user || user.is_guest) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <p>Please log in to view your decks.</p>
        <Link href="/login">
          <Button>Log In</Button>
        </Link>
      </div>
    )
  }

  const totalRootItems = rootFolders.length + rootDecks.length

  return (
    <div className="container mx-auto max-w-5xl p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Decks</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsImportDialogOpen(true)}
          >
            <Upload className="mr-2 h-4 w-4" /> Import
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsCreateFolderOpen(true)}
          >
            <FolderPlus className="mr-2 h-4 w-4" /> New Folder
          </Button>
          <Button onClick={() => setIsCreateDeckOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Deck
          </Button>
        </div>
      </div>

      {itemsError && (
        <Alert variant="destructive" className="mb-6">
          {itemsError.message}
        </Alert>
      )}
      {deleteDeck.error && (
        <Alert variant="destructive" className="mb-6">
          {deleteDeck.error.message}
        </Alert>
      )}
      {deleteFolder.error && (
        <Alert variant="destructive" className="mb-6">
          {deleteFolder.error.message}
        </Alert>
      )}

      {totalRootItems === 0 ? (
        <div className="rounded-lg border bg-muted/20 p-12 text-center">
          <p className="mb-4 text-muted-foreground">
            You don&apos;t have any decks or folders yet.
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={() => setIsCreateFolderOpen(true)} variant="outline">
              Create a folder
            </Button>
            <Button onClick={() => setIsCreateDeckOpen(true)}>
              Create a deck
            </Button>
          </div>
        </div>
      ) : (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rootFolders.map((folder) => {
              const count = items.filter(
                (i) =>
                  (i.type === "folder" && i.parent_id === folder.id) ||
                  (i.type === "deck" && i.folder_id === folder.id)
              ).length

              return (
                <FolderCard
                  key={folder.id}
                  folder={folder}
                  itemCount={count}
                  username={user?.username}
                  onEdit={setEditingFolder}
                  onDelete={handleDeleteFolder}
                />
              )
            })}

            {rootDecks.map((deck) => (
              <DeckCard
                key={deck.id}
                deck={deck}
                username={user.username}
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
      />

      <CreateFolderDialog
        open={isCreateFolderOpen}
        onOpenChange={setIsCreateFolderOpen}
      />

      <EditFolderDialog
        folder={editingFolder}
        onClose={() => setEditingFolder(null)}
      />

      {isImportDialogOpen && (
        <DeckImportDialog
          mode="create"
          username={user.username}
          onClose={() => setIsImportDialogOpen(false)}
        />
      )}

      <ShareDeckDialog
        key={shareDeckTarget?.id ?? "closed"}
        deck={shareDeckTarget}
        onClose={() => setShareDeckTarget(null)}
      />
    </div>
  )
}
