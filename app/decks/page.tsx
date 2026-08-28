"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { LegalLinks } from "@/components/LegalLinks"
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
import { GuestWarningCard } from "@/components/decks/GuestWarningCard"
import { DeckCard } from "@/components/decks/DeckCard"
import { FolderCard } from "@/components/folders/FolderCard"
import { CreateFolderDialog } from "@/components/folders/CreateFolderDialog"
import { EditFolderDialog } from "@/components/folders/EditFolderDialog"
import { DeleteFolderDialog } from "@/components/folders/DeleteFolderDialog"
import { ShareFolderDialog } from "@/components/folders/ShareFolderDialog"
import { GuestShareDialog } from "@/components/shared/GuestShareDialog"
import { MoveItemDialog, MoveTarget } from "@/components/shared/MoveItemDialog"
import { useUpdateDeck, useDeleteDeck } from "@/hooks/useDecks"
import {
  useUserItems,
  useUpdateFolder,
  useDeleteFolder,
} from "@/hooks/useFolders"
import { useUserFavorites } from "@/hooks/useCommunity"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useCustomTheme } from "@/components/theme/custom-theme-provider"
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"

export default function DecksPage() {
  const t = useTranslations("Decks")
  const { user, loading: authLoading } = useAuth()
  const { deckDisplayMode } = useCustomTheme()
  const isLineMode = deckDisplayMode === "line"

  const {
    data: ownedItems = [],
    isLoading: itemsLoading,
    error: itemsError,
  } = useUserItems()

  const { data: favorites = [] } = useUserFavorites()

  const updateDeck = useUpdateDeck()
  const deleteDeck = useDeleteDeck()
  const updateFolder = useUpdateFolder()
  const deleteFolder = useDeleteFolder()

  const [isCreateDeckOpen, setIsCreateDeckOpen] = useState(false)
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [shareDeckTarget, setShareDeckTarget] = useState<Deck | null>(null)
  const [shareFolderTarget, setShareFolderTarget] = useState<Folder | null>(
    null
  )
  const [guestShareOpen, setGuestShareOpen] = useState(false)
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null)
  const [editingDeckTarget, setEditingDeckTarget] = useState<Deck | null>(null)
  const [moveTarget, setMoveTarget] = useState<MoveTarget | null>(null)
  const [deleteDeckTarget, setDeleteDeckTarget] = useState<string | null>(null)
  const [deleteFolderTarget, setDeleteFolderTarget] = useState<string | null>(
    null
  )

  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const isGuest = Boolean(user?.is_guest)
  const hasCreatedDeck = useMemo(() => {
    return ownedItems.some((item) => item.type !== "folder")
  }, [ownedItems])

  // Merge owned items with favorited items that were created by others
  const allItems = useMemo(() => {
    const ownedIds = new Set(ownedItems.map((item) => item.id))
    const externalFavorites = favorites.filter((fav) => !ownedIds.has(fav.id))
    return [...ownedItems, ...externalFavorites]
  }, [ownedItems, favorites])

  const filteredItems = allItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const rootFolders = filteredItems.filter(
    (item): item is Folder =>
      item.type === "folder" && (!item.parent_id || searchQuery.length > 0)
  )
  const rootDecks = filteredItems.filter(
    (item): item is Deck =>
      item.type === "deck" && (!item.folder_id || searchQuery.length > 0)
  )

  const handleDeleteDeck = (deckId: string) => {
    setDeleteDeckTarget(deckId)
  }

  const handleDeleteFolder = (folderId: string) => {
    setDeleteFolderTarget(folderId)
  }

  const handleShareDeck = (deck: Deck) => {
    if (isGuest) {
      setGuestShareOpen(true)
      return
    }
    setShareDeckTarget(deck)
  }

  const handleShareFolder = (folder: Folder) => {
    if (isGuest) {
      setGuestShareOpen(true)
      return
    }
    setShareFolderTarget(folder)
  }

  const handleMoveDeck = (deck: Deck) => {
    setMoveTarget({
      id: deck.id,
      type: "deck",
      name: deck.name,
      currentParentId: deck.folder_id || null,
    })
  }

  const handleMoveFolder = (folder: Folder) => {
    setMoveTarget({
      id: folder.id,
      type: "folder",
      name: folder.name,
      currentParentId: folder.parent_id || null,
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

  if (authLoading || itemsLoading) {
    return (
      <div className="container mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-10 sm:py-16">
        <div className="mb-8 flex items-center gap-3">
          <Skeleton className="h-11 w-11 rounded-2xl" />
          <Skeleton className="h-9 w-48 rounded-xl" />
        </div>
        <div
          className={cn(
            isLineMode
              ? "flex flex-col gap-2"
              : "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          )}
        >
          <Skeleton
            className={cn(
              isLineMode ? "h-12 rounded-2xl" : "h-[130px] rounded-2xl"
            )}
          />
          <Skeleton
            className={cn(
              isLineMode ? "h-12 rounded-2xl" : "h-[130px] rounded-2xl"
            )}
          />
          <Skeleton
            className={cn(
              isLineMode ? "h-12 rounded-2xl" : "h-[130px] rounded-2xl"
            )}
          />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <p>{t("notLoggedIn")}</p>
        <Link href="/login">
          <Button className="rounded-xl">{t("logIn")}</Button>
        </Link>
      </div>
    )
  }

  const totalRootItems = rootFolders.length + rootDecks.length

  return (
    <div className="container mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-10 sm:py-16">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex shrink-0 items-center justify-center rounded-2xl bg-primary/10 p-2.5 text-primary shadow-sm">
            <Layers className="h-6 w-6" />
          </div>
          <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
            {t("title")}
          </h1>
          <Badge
            variant="secondary"
            className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold"
          >
            {filteredItems.filter((item) => item.type === "deck").length}
          </Badge>
        </div>

        <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:flex-nowrap">
          <Button
            variant="outline"
            className="w-9 gap-2 rounded-xl border-border/80 px-0 font-medium sm:w-auto sm:px-3"
            size="sm"
            onClick={() => setIsImportDialogOpen(true)}
          >
            <Upload className="h-4 w-4" />{" "}
            <span className="hidden sm:inline">{t("import")}</span>
          </Button>
          <Button
            variant="outline"
            className="w-9 gap-2 rounded-xl border-border/80 px-0 font-medium sm:w-auto sm:px-3"
            size="sm"
            onClick={() => setIsCreateFolderOpen(true)}
          >
            <FolderPlus className="h-4 w-4" />{" "}
            <span className="hidden sm:inline">{t("folder")}</span>
          </Button>
          <Button
            className="gap-2 rounded-xl font-medium"
            size="sm"
            onClick={() => setIsCreateDeckOpen(true)}
          >
            <Plus className="h-4 w-4" /> <span>{t("deck")}</span>
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
                "h-9 w-9 rounded-xl transition-colors hover:bg-primary/10 hover:text-primary sm:h-10 sm:w-10",
                isSearchOpen ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>

            {isSearchOpen && (
              <div className="absolute top-12 right-0 z-20 flex items-center">
                <Input
                  autoFocus
                  placeholder={t("searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-[200px] rounded-xl border-border bg-card/95 pr-8 text-sm shadow-lg backdrop-blur-md sm:h-10 sm:w-48 md:w-64"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 h-9 w-9 rounded-xl text-muted-foreground hover:bg-transparent hover:text-foreground sm:h-10 sm:w-10"
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

      {isGuest && hasCreatedDeck && <GuestWarningCard />}

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
        <Card className="rounded-3xl border-2 border-dashed border-border/80 bg-card/40 p-8 text-center sm:p-12">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Layers className="h-6 w-6" />
          </div>
          <p className="mb-1 text-lg font-semibold text-foreground">
            {searchQuery ? t("noMatchesTitle") : t("noDecksTitle")}
          </p>
          <p className="mb-6 text-sm text-muted-foreground">
            {searchQuery
              ? t("noMatchesDesc", { query: searchQuery })
              : t("noDecksDesc")}
          </p>
          {!searchQuery && (
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                onClick={() => setIsCreateFolderOpen(true)}
                variant="outline"
                className="rounded-xl"
              >
                {t("createFolder")}
              </Button>
              <Button
                onClick={() => setIsCreateDeckOpen(true)}
                className="gap-2 rounded-xl font-medium"
              >
                <Plus className="h-4 w-4" />
                {t("createFirstDeck")}
              </Button>
            </div>
          )}
        </Card>
      ) : (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="space-y-5">
            {rootFolders.length > 0 && (
              <div
                className={cn(
                  isLineMode
                    ? "flex flex-col gap-2"
                    : "grid grid-cols-1 gap-4 pr-2 pb-2 sm:grid-cols-2 lg:grid-cols-3"
                )}
              >
                {rootFolders.map((folder) => {
                  const isOwner = folder.user_id === user?.id
                  return (
                    <FolderCard
                      key={folder.id}
                      folder={folder}
                      username={user?.username}
                      isOwner={isOwner}
                      onShare={
                        isOwner ? () => handleShareFolder(folder) : undefined
                      }
                      onEdit={isOwner ? setEditingFolder : undefined}
                      onDelete={isOwner ? handleDeleteFolder : undefined}
                      onMove={isOwner ? handleMoveFolder : undefined}
                    />
                  )
                })}
              </div>
            )}

            {rootFolders.length > 0 && rootDecks.length > 0 && (
              <hr className="my-6 border-border/60" />
            )}

            {rootDecks.length > 0 && (
              <div
                className={cn(
                  isLineMode
                    ? "flex flex-col gap-2"
                    : "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                )}
              >
                {rootDecks.map((deck) => {
                  const isOwner = deck.user_id === user?.id
                  return (
                    <DeckCard
                      key={deck.id}
                      deck={deck}
                      username={user?.username}
                      isOwner={isOwner}
                      onShare={
                        isOwner ? () => handleShareDeck(deck) : undefined
                      }
                      onEdit={isOwner ? setEditingDeckTarget : undefined}
                      onDelete={isOwner ? handleDeleteDeck : undefined}
                      onMove={isOwner ? handleMoveDeck : undefined}
                    />
                  )
                })}
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

      <GuestShareDialog
        open={guestShareOpen}
        onClose={() => setGuestShareOpen(false)}
      />

      <EditDeckDialog
        key={editingDeckTarget?.id ?? "closed-edit"}
        deck={editingDeckTarget}
        onClose={() => setEditingDeckTarget(null)}
      />

      <MoveItemDialog item={moveTarget} onClose={() => setMoveTarget(null)} />

      <DeleteDeckDialog
        deckId={deleteDeckTarget}
        onClose={() => setDeleteDeckTarget(null)}
      />

      <DeleteFolderDialog
        folderId={deleteFolderTarget}
        onClose={() => setDeleteFolderTarget(null)}
      />

      <LegalLinks />
    </div>
  )
}
