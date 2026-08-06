"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/AuthContext"
import { Button } from "@/components/ui/button"
import { Alert } from "@/components/ui/alert"
import { Plus, Upload, FolderPlus, Layers, Search, X } from "lucide-react"
import { Deck, Folder } from "@/types"
import { CreateDeckDialog } from "@/components/decks/CreateDeckDialog"
import { DeckImportDialog } from "@/components/decks/DeckImportDialog"
import { ShareDeckDialog } from "@/components/decks/ShareDeckDialog"
import { EditDeckDialog } from "@/components/decks/EditDeckDialog"
import { DeleteDeckDialog } from "@/components/decks/DeleteDeckDialog"
import { DeckCard } from "@/components/decks/DeckCard"
import { FolderCard } from "@/components/folders/FolderCard"
import { CreateFolderDialog } from "@/components/folders/CreateFolderDialog"
import { EditFolderDialog } from "@/components/folders/EditFolderDialog"
import { DeleteFolderDialog } from "@/components/folders/DeleteFolderDialog"
import { ShareFolderDialog } from "@/components/folders/ShareFolderDialog"
import { MoveItemDialog, MoveTarget } from "@/components/shared/MoveItemDialog"
import { useUpdateDeck, useDeleteDeck } from "@/hooks/useDecks"
import { useUserItems, useUpdateFolder, useDeleteFolder } from "@/hooks/useFolders"
import { useSRSCounts } from "@/hooks/useSRSCounts"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
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
  const [shareFolderTarget, setShareFolderTarget] = useState<Folder | null>(null)
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null)
  const [editingDeckTarget, setEditingDeckTarget] = useState<Deck | null>(null)
  const [moveTarget, setMoveTarget] = useState<MoveTarget | null>(null)
  const [deleteDeckTarget, setDeleteDeckTarget] = useState<string | null>(null)
  const [deleteFolderTarget, setDeleteFolderTarget] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const rootFolders = filteredItems.filter(
    (item): item is Folder => item.type === "folder" && !item.parent_id
  )
  const rootDecks = filteredItems.filter(
    (item): item is Deck => item.type === "deck" && !item.folder_id
  )

  const handleDeleteDeck = (deckId: string) => {
    setDeleteDeckTarget(deckId)
  }

  const handleDeleteFolder = (folderId: string) => {
    setDeleteFolderTarget(folderId)
  }

  const handleMoveDeck = (deck: Deck) => {
    setMoveTarget({ id: deck.id, type: "deck", name: deck.name, currentParentId: deck.folder_id || null })
  }

  const handleMoveFolder = (folder: Folder) => {
    setMoveTarget({ id: folder.id, type: "folder", name: folder.name, currentParentId: folder.parent_id || null })
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
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8 sm:px-10 sm:py-16 space-y-8">
        <div className="flex items-center gap-3 mb-8">
          <Skeleton className="h-11 w-11 rounded-2xl" />
          <Skeleton className="h-9 w-48 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-[130px] rounded-2xl" />
          <Skeleton className="h-[130px] rounded-2xl" />
          <Skeleton className="h-[130px] rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!user || user.is_guest) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <p>Please log in to view your decks.</p>
        <Link href="/login">
          <Button className="rounded-xl">Log In</Button>
        </Link>
      </div>
    )
  }

  const totalRootItems = rootFolders.length + rootDecks.length

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 sm:px-10 sm:py-16 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-sm shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">My Decks</h1>
          <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-xs font-semibold shrink-0">
            {filteredItems.filter(item => item.type === 'deck').length}
          </Badge>
        </div>
        
        <div className="flex items-center justify-end w-full sm:w-auto gap-2 flex-wrap sm:flex-nowrap">
          <Button
            variant="outline"
            className="rounded-xl gap-2 font-medium border-border/80 w-9 px-0 sm:w-auto sm:px-3"
            size="sm"
            onClick={() => setIsImportDialogOpen(true)}
          >
            <Upload className="h-4 w-4" /> <span className="hidden sm:inline">Import</span>
          </Button>
          <Button
            variant="outline"
            className="rounded-xl gap-2 font-medium border-border/80 w-9 px-0 sm:w-auto sm:px-3"
            size="sm"
            onClick={() => setIsCreateFolderOpen(true)}
          >
            <FolderPlus className="h-4 w-4" /> <span className="hidden sm:inline">Folder</span>
          </Button>
          <Button 
            className="rounded-xl gap-2 font-medium"
            size="sm"
            onClick={() => setIsCreateDeckOpen(true)}>
            <Plus className="h-4 w-4" /> <span>Deck</span>
          </Button>

          <div className="relative sm:ml-2">
            <Button
              variant={isSearchOpen ? "secondary" : "ghost"}
              size="icon"
              onClick={() => {
                if (isSearchOpen) setSearchQuery("")
                setIsSearchOpen(!isSearchOpen)
              }}
              className={cn(
                "h-9 w-9 sm:h-10 sm:w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors",
                isSearchOpen ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            
            {isSearchOpen && (
              <div className="absolute right-0 top-12 z-20 flex items-center">
                <Input
                  autoFocus
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-[200px] sm:w-48 md:w-64 pr-8 rounded-xl h-9 sm:h-10 border-border bg-card/95 backdrop-blur-md shadow-lg text-sm"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 h-9 w-9 sm:h-10 sm:w-10 text-muted-foreground hover:text-foreground hover:bg-transparent rounded-xl"
                  onClick={() => {
                    setSearchQuery("")
                    setIsSearchOpen(false)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {itemsError && (
        <Alert variant="destructive" className="mb-6 rounded-xl">
          {itemsError.message}
        </Alert>
      )}
      {deleteDeck.error && (
        <Alert variant="destructive" className="mb-6 rounded-xl">
          {deleteDeck.error.message}
        </Alert>
      )}
      {deleteFolder.error && (
        <Alert variant="destructive" className="mb-6 rounded-xl">
          {deleteFolder.error.message}
        </Alert>
      )}

      {totalRootItems === 0 ? (
        <Card className="rounded-3xl border-2 border-dashed border-border/80 p-8 sm:p-12 text-center bg-card/40">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            <Layers className="w-6 h-6" />
          </div>
          <p className="text-lg font-semibold text-foreground mb-1">
            {searchQuery ? "No matches found" : "No decks yet"}
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            {searchQuery
              ? `No decks or folders matched "${searchQuery}".`
              : "Create your first deck to start studying with flashcards!"}
          </p>
          {!searchQuery && (
            <div className="flex justify-center gap-3 flex-wrap">
              <Button onClick={() => setIsCreateFolderOpen(true)} variant="outline" className="rounded-xl">
                Create a folder
              </Button>
              <Button onClick={() => setIsCreateDeckOpen(true)} className="rounded-xl gap-2 font-medium">
                <Plus className="w-4 h-4" />
                Create First Deck
              </Button>
            </div>
          )}
        </Card>
      ) : (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="space-y-5">
            {rootFolders.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pr-2 pb-2">
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
                      username={user?.username}
                      itemCount={count}
                      onShare={setShareFolderTarget}
                      onEdit={setEditingFolder}
                      onDelete={handleDeleteFolder}
                      onMove={handleMoveFolder}
                    />
                  )
                })}
              </div>
            )}

            {rootFolders.length > 0 && rootDecks.length > 0 && (
              <hr className="border-border/60 my-6" />
            )}

            {rootDecks.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {rootDecks.map((deck) => (
                  <DeckCard
                    key={deck.id}
                    deck={deck}
                    username={user.username}
                    srsCounts={srsCountsData?.[deck.id]}
                    onShare={setShareDeckTarget}
                    onEdit={setEditingDeckTarget}
                    onDelete={handleDeleteDeck}
                    onMove={handleMoveDeck}
                  />
                ))}
              </div>
            )}
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
        key={shareDeckTarget?.id ?? "closed-share-deck"}
        deck={shareDeckTarget}
        onClose={() => setShareDeckTarget(null)}
      />

      <ShareFolderDialog
        key={shareFolderTarget?.id ?? "closed-share-folder"}
        folder={shareFolderTarget}
        onClose={() => setShareFolderTarget(null)}
      />

      <EditDeckDialog
        key={editingDeckTarget?.id ?? "closed-edit"}
        deck={editingDeckTarget}
        onClose={() => setEditingDeckTarget(null)}
      />

      <MoveItemDialog
        item={moveTarget}
        onClose={() => setMoveTarget(null)}
      />

      <DeleteDeckDialog
        deckId={deleteDeckTarget}
        onClose={() => setDeleteDeckTarget(null)}
      />

      <DeleteFolderDialog
        folderId={deleteFolderTarget}
        onClose={() => setDeleteFolderTarget(null)}
      />
    </div>
  )
}
