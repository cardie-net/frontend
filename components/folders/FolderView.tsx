"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/AuthContext"
import { Button } from "@/components/ui/button"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Plus,
  FolderPlus,
  Folder as FolderIcon,
  Search,
  Upload,
  X,
  Star,
} from "lucide-react"
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
import { useUpdateDeck } from "@/hooks/useDecks"
import {
  useFolder,
  useFolderItems,
  useUserItems,
  useUpdateFolder,
} from "@/hooks/useFolders"
import { useStarFolder, useUnstarFolder, useUserStarred } from "@/hooks/useCommunity"

import { getDeckColorClass } from "@/lib/decks"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"

interface FolderViewProps {
  username: string
  folder: Folder
}

export function FolderView({ username, folder }: FolderViewProps) {
  const router = useRouter()
  const { user } = useAuth()

  const { data: parentFolder } = useFolder(folder.parent_id || undefined)
  const {
    data: folderItems = [],
    isLoading: folderItemsLoading,
    error: folderItemsError,
  } = useFolderItems(folder.id)
  const { data: allUserItems = [] } = useUserItems(folder.user_id)

  const updateDeck = useUpdateDeck()
  const updateFolder = useUpdateFolder()

  const { data: starredData } = useUserStarred()
  const starFolder = useStarFolder()
  const unstarFolder = useUnstarFolder()

  const isStarred =
    starredData?.folder_ids !== undefined
      ? starredData.folder_ids.includes(folder.id)
      : (folder.is_starred ?? false)

  const starsCount = folder.stars_count ?? 0
  const [isStarPending, setIsStarPending] = useState(false)

  const handleToggleStar = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user || user.is_guest) {
      router.push("/login")
      return
    }

    if (isStarPending) return
    setIsStarPending(true)

    try {
      if (isStarred) {
        await unstarFolder.mutateAsync(folder.id)
      } else {
        await starFolder.mutateAsync(folder.id)
      }
    } finally {
      setIsStarPending(false)
    }
  }

  const [isCreateDeckOpen, setIsCreateDeckOpen] = useState(false)
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null)
  const [shareDeckTarget, setShareDeckTarget] = useState<Deck | null>(null)
  const [shareFolderTarget, setShareFolderTarget] = useState<Folder | null>(null)
  const [editingDeckTarget, setEditingDeckTarget] = useState<Deck | null>(null)
  const [moveTarget, setMoveTarget] = useState<MoveTarget | null>(null)
  const [deleteDeckTarget, setDeleteDeckTarget] = useState<string | null>(null)
  const [deleteFolderTarget, setDeleteFolderTarget] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const isOwner = !!(
    user &&
    folder &&
    user.id === folder.user_id
  )

  const itemsToSearch = searchQuery.length > 0 ? allUserItems : folderItems

  const filteredItems = itemsToSearch.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const childFolders = filteredItems.filter(
    (item): item is Folder => item.type === "folder" && (item.parent_id === folder.id || searchQuery.length > 0)
  )
  const childDecks = filteredItems.filter(
    (item): item is Deck => item.type === "deck" && (item.folder_id === folder.id || searchQuery.length > 0)
  )

  const handleDeleteDeck = (deckId: string) => {
    setDeleteDeckTarget(deckId)
  }

  const handleDeleteSubFolder = (subFolderId: string) => {
    setDeleteFolderTarget(subFolderId)
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

  const backHref = parentFolder?.slug
    ? `/${username}/${parentFolder.slug}`
    : "/decks"

  const totalItems = childFolders.length + childDecks.length

  return (
    <div className="flex flex-col w-full">
      {folder.properties?.cover_image_url ? (
        <div className="w-full aspect-[4/1] max-h-56 sm:max-h-72 bg-muted">
          <img 
            src={folder.properties.cover_image_url} 
            alt={`${folder.name} cover`}
            className="w-full h-full object-cover"
          />
        </div>
      ) : null}

      <div className={cn(
        "container mx-auto max-w-4xl px-4 pb-8 sm:px-10 sm:pb-16 space-y-8",
        folder.properties?.cover_image_url ? "pt-6 sm:pt-8" : "pt-8 sm:pt-16"
      )}>
      {/* Header & Navigation */}
      <div className="flex flex-col">

        <div className="flex flex-col w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "p-2.5 rounded-2xl flex items-center justify-center shadow-sm shrink-0",
                  folder.properties?.color
                    ? getDeckColorClass(folder.properties.color)
                    : "bg-primary/10 text-primary"
                )}
              >
                <FolderIcon className="h-6 w-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">
                {folder.name}
              </h1>
              {isOwner ? (
                <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-xs font-semibold shrink-0">
                  {totalItems}
                </Badge>
              ) : (
                <button
                  type="button"
                  onClick={handleToggleStar}
                  disabled={isStarPending}
                  aria-label={isStarred ? "Unstar folder" : "Star folder"}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer shadow-sm shrink-0",
                    isStarred
                      ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/25"
                      : "bg-muted/80 text-muted-foreground hover:text-foreground hover:bg-muted border border-border/60"
                  )}
                >
                  <Star
                    className={cn(
                      "w-3.5 h-3.5 transition-transform duration-200",
                      isStarred
                        ? "fill-current text-amber-500 scale-110"
                        : "text-muted-foreground"
                    )}
                  />
                  <span>{starsCount}</span>
                </button>
              )}
            </div>

            <div className="flex items-center justify-end w-full sm:w-auto gap-2 flex-wrap sm:flex-nowrap">
            {isOwner && (
              <>
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
              </>
            )}

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

          {folder.properties?.description && (
            <div className="mt-4 min-w-0">
              <p className="text-sm text-foreground/90 whitespace-pre-wrap break-all">
                {folder.properties.description}
              </p>
            </div>
          )}
        </div>

        <Link
          href={backHref}
          className="mt-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground w-fit"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {parentFolder ? `Back to ${parentFolder.name}` : "Back to Decks"}
        </Link>
      </div>

      {folderItemsError && (
        <Alert variant="destructive" className="mb-6 rounded-xl">
          {folderItemsError.message}
        </Alert>
      )}

      {/* Items Grid */}
      {folderItemsLoading ? (
        <div className="p-8">Loading folder items...</div>
      ) : totalItems === 0 ? (
        <Card className="rounded-3xl border-2 border-dashed border-border/80 p-8 sm:p-12 text-center bg-card/40">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            <FolderIcon className="w-6 h-6" />
          </div>
          <p className="text-lg font-semibold text-foreground mb-1">
            {searchQuery ? "No matches found" : "This folder is empty"}
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            {searchQuery
              ? `No decks or folders matched "${searchQuery}".`
              : "Create your first deck or subfolder here!"}
          </p>
          {!searchQuery && isOwner && (
            <div className="flex justify-center gap-3 flex-wrap">
              <Button onClick={() => setIsCreateFolderOpen(true)} variant="outline" className="rounded-xl">
                Create a subfolder
              </Button>
              <Button onClick={() => setIsCreateDeckOpen(true)} className="rounded-xl gap-2 font-medium">
                <Plus className="w-4 h-4" />
                Create a deck
              </Button>
            </div>
          )}
        </Card>
      ) : (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="space-y-5">
            {childFolders.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pr-2 pb-2">
                {childFolders.map((subFolder) => {
                  return (
                    <FolderCard
                      key={subFolder.id}
                      folder={subFolder}
                      username={username}
                      isOwner={isOwner}
                      onShare={setShareFolderTarget}
                      onEdit={setEditingFolder}
                      onDelete={handleDeleteSubFolder}
                      onMove={handleMoveFolder}
                    />
                  )
                })}
              </div>
            )}

            {childFolders.length > 0 && childDecks.length > 0 && (
              <hr className="border-border/60 my-6" />
            )}

            {childDecks.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {childDecks.map((deck) => (
                  <DeckCard
                    key={deck.id}
                    deck={deck}
                    username={username}
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
        folderId={folder.id}
      />

      <CreateFolderDialog
        open={isCreateFolderOpen}
        onOpenChange={setIsCreateFolderOpen}
        parentId={folder.id}
      />

      {isImportDialogOpen && (
        <DeckImportDialog
          mode="create"
          username={user?.username}
          folderId={folder.id}
          onClose={() => setIsImportDialogOpen(false)}
        />
      )}

      <EditFolderDialog
        folder={editingFolder}
        onClose={() => setEditingFolder(null)}
      />

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
        onDeleted={() => {
          if (deleteFolderTarget === folder.id) {
            router.push(
              parentFolder?.slug ? `/${username}/${parentFolder.slug}` : "/decks"
            )
          }
        }}
      />
      </div>
    </div>
  )
}
