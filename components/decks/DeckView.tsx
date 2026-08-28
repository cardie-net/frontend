"use client"

import { useState, useRef, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useTranslations, useLocale } from "next-intl"
import { LegalLinks } from "@/components/LegalLinks"
import { useAuth } from "@/lib/AuthContext"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Plus,
  Layers,
  Upload,
  Download,
  ArrowLeftRight,
  Calendar,
  Clock,
  Star,
  Share2,
} from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"

import { FlashCard, Deck } from "@/types"
import { SortableCardRow } from "@/components/cards/SortableCardRow"
import { AddCardForm } from "@/components/cards/AddCardForm"
import {
  CardEditDialog,
  NewCardDialog,
} from "@/components/cards/CardEditDialog"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { DeckActionButtons } from "@/components/decks/DeckActionButtons"
import { DeckImportDialog } from "@/components/decks/DeckImportDialog"
import { DeckExportDialog } from "@/components/decks/DeckExportDialog"
import { ShareDeckDialog } from "@/components/decks/ShareDeckDialog"
import { GuestShareDialog } from "@/components/shared/GuestShareDialog"
import { useFolder } from "@/hooks/useFolders"
import {
  useCards,
  useCreateCard,
  useUpdateCard,
  useDeleteCard,
  useReorderCards,
  useTransposeDeck,
} from "@/hooks/useCards"
import {
  buildElements,
  getCardImage,
  getCardText,
  uploadCardImage,
} from "@/lib/cards"
import { getDeckColorClass } from "@/lib/decks"
import { useStarDeck, useUnstarDeck, useUserStarred } from "@/hooks/useCommunity"
import { cn, formatDate, formatDateTime, formatRelativeTime } from "@/lib/utils"

interface DeckViewProps {
  username: string
  slug: string
  deck: Deck
}

export function DeckView({ username, slug, deck }: DeckViewProps) {
  const t = useTranslations("DeckView")
  const locale = useLocale()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  const { data: cards = [], isLoading: cardsLoading } = useCards(deck.id)
  const { data: parentFolder } = useFolder(deck.folder_id || undefined)

  const [shareDeckTarget, setShareDeckTarget] = useState<Deck | null>(null)
  const [guestShareOpen, setGuestShareOpen] = useState(false)

  const isOwner = !!(user && deck && user.id === deck.user_id)

  const handleShareClick = () => {
    if (user?.is_guest && isOwner) {
      setGuestShareOpen(true)
      return
    }
    setShareDeckTarget(deck)
  }

  const createCard = useCreateCard()
  const updateCard = useUpdateCard()
  const deleteCard = useDeleteCard()
  const reorderCards = useReorderCards()
  const transposeDeck = useTransposeDeck()

  const { data: starredData } = useUserStarred()
  const starDeck = useStarDeck()
  const unstarDeck = useUnstarDeck()

  const isStarred =
    starredData?.deck_ids !== undefined
      ? starredData.deck_ids.includes(deck.id)
      : (deck.is_starred ?? false)

  const starsCount = deck.stars_count ?? 0
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
        await unstarDeck.mutateAsync(deck.id)
      } else {
        await starDeck.mutateAsync(deck.id)
      }
    } finally {
      setIsStarPending(false)
    }
  }

  // Popup (full) edit state
  const [editingCard, setEditingCard] = useState<FlashCard | null>(null)
  const [showNewCardDialog, setShowNewCardDialog] = useState(false)
  // Incremented after "Save & add another" to remount the dialog with fresh empty fields.
  const [newCardDialogKey, setNewCardDialogKey] = useState(0)

  // Inline edit state
  const [editingCardId, setEditingCardId] = useState<string | null>(null)
  const [editFront, setEditFront] = useState("")
  const [editBack, setEditBack] = useState("")
  const [editFrontImage, setEditFrontImage] = useState<string | null>(null)
  const [editBackImage, setEditBackImage] = useState<string | null>(null)

  // Latest editingCardId, readable from async callbacks (e.g. auto-save on blur).
  const editingCardIdRef = useRef<string | null>(null)
  useEffect(() => {
    editingCardIdRef.current = editingCardId
  }, [editingCardId])

  // New card state
  const [newFront, setNewFront] = useState("")
  const [newBack, setNewBack] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)

  // Import/export dialog state
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showTransposeDialog, setShowTransposeDialog] = useState(false)

  const cardsRef = useRef<HTMLDivElement>(null)

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // Scroll to cards section if ?edit=true
  useEffect(() => {
    if (
      !cardsLoading &&
      searchParams.get("edit") === "true" &&
      cardsRef.current
    ) {
      cardsRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [cardsLoading, searchParams])

  // --- Card Editing ---

  // Simple click on the card starts inline editing (fast path).
  const handleStartEdit = (card: FlashCard) => {
    const frontText = getCardText(card.front)
    const backText = getCardText(card.back)

    if (frontText.includes("\n") || backText.includes("\n")) {
      handleOpenFullEdit(card)
      return
    }

    setEditingCardId(card.id)
    setEditFront(frontText)
    setEditBack(backText)
    setEditFrontImage(getCardImage(card.front)?.url ?? null)
    setEditBackImage(getCardImage(card.back)?.url ?? null)
  }

  const handleCancelEdit = () => {
    setEditingCardId(null)
    setEditFront("")
    setEditBack("")
    setEditFrontImage(null)
    setEditBackImage(null)
  }

  const handleSaveEdit = () => {
    if (!editingCardId || !deck) return
    const cardIdToSave = editingCardId
    // Preserve any image elements the card already has on each side.
    const card = cards.find((c) => c.id === cardIdToSave)
    const frontImage =
      editFrontImage ?? (card ? (getCardImage(card.front)?.url ?? null) : null)
    const backImage =
      editBackImage ?? (card ? (getCardImage(card.back)?.url ?? null) : null)
    updateCard.mutate(
      {
        deckId: deck.id,
        cardId: cardIdToSave,
        front: buildElements(editFront, frontImage),
        back: buildElements(editBack, backImage),
      },
      {
        onSuccess: () => {
          // If the user already moved on to edit another card, don't touch that edit.
          if (editingCardIdRef.current !== cardIdToSave) return
          setEditingCardId(null)
          setEditFront("")
          setEditBack("")
          setEditFrontImage(null)
          setEditBackImage(null)
        },
      }
    )
  }

  // Escalate from inline editing to the full popup editor.
  const handleOpenFullEdit = (card: FlashCard) => {
    handleCancelEdit()
    setEditingCard(card)
  }

  const handleImagePaste = async (
    cardId: string,
    side: "front" | "back",
    file: File
  ) => {
    if (cardId !== editingCardId) return
    try {
      const url = await uploadCardImage(deck.id, file)

      if (side === "front") {
        setEditFrontImage(url)
      } else {
        setEditBackImage(url)
      }

      const card = cards.find((c) => c.id === cardId)
      if (!card) return

      const frontImage =
        side === "front"
          ? url
          : (editFrontImage ?? getCardImage(card.front)?.url ?? null)
      const backImage =
        side === "back"
          ? url
          : (editBackImage ?? getCardImage(card.back)?.url ?? null)

      const finalFrontText =
        cardId === editingCardId ? editFront : getCardText(card.front)
      const finalBackText =
        cardId === editingCardId ? editBack : getCardText(card.back)

      updateCard.mutate({
        deckId: deck.id,
        cardId,
        front: buildElements(finalFrontText, frontImage),
        back: buildElements(finalBackText, backImage),
      })
    } catch (e) {
      console.error(e)
      alert("Failed to upload image")
    }
  }

  // --- Add Card ---

  const handleAddCard = async () => {
    if (!deck || !newFront.trim()) return
    createCard.mutate(
      {
        deckId: deck.id,
        front: [{ type: "text", content: newFront }],
        back: [{ type: "text", content: newBack }],
      },
      {
        onSuccess: () => {
          setNewFront("")
          setNewBack("")
        },
      }
    )
  }

  // --- Delete Card ---

  const handleDeleteCard = (cardId: string) => {
    if (!deck) return
    deleteCard.mutate({ deckId: deck.id, cardId })
    if (editingCardId === cardId) handleCancelEdit()
    if (editingCard?.id === cardId) setEditingCard(null)
  }

  // --- Reorder ---

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id || !deck) return

    const oldIndex = cards.findIndex((c) => c.id === active.id)
    const newIndex = cards.findIndex((c) => c.id === over.id)

    // Create a new array with the dragged item moved
    const newCards = [...cards]
    const [movedItem] = newCards.splice(oldIndex, 1)
    newCards.splice(newIndex, 0, movedItem)

    reorderCards.mutate({
      deckId: deck.id,
      orderedIds: newCards.map((c) => c.id),
    })
  }

  if (cardsLoading) {
    return (
      <div className="container mx-auto max-w-5xl space-y-8 p-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col">
      {deck.properties?.cover_image_url && (
        <div className="aspect-[4/1] max-h-56 w-full bg-muted sm:max-h-72">
          <img
            src={deck.properties.cover_image_url}
            alt={`${deck.name} cover`}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div
        className={cn(
          "container mx-auto max-w-4xl space-y-8 px-4 pb-8 sm:px-10 sm:pb-16",
          deck.properties?.cover_image_url ? "pt-6 sm:pt-8" : "pt-8 sm:pt-16"
        )}
      >
        {/* Header & Navigation */}
        <div className="flex flex-col min-w-0">
          <div className="flex w-full flex-col min-w-0">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center min-w-0">
              <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                <div
                  className={cn(
                    "flex shrink-0 items-center justify-center rounded-2xl p-2.5 shadow-sm mt-0.5 sm:mt-0",
                    deck.properties?.color
                      ? getDeckColorClass(deck.properties.color)
                      : "bg-primary/10 text-primary"
                  )}
                >
                  <Layers className="h-6 w-6" />
                </div>
                <h1 className="line-clamp-2 sm:truncate text-2xl font-bold tracking-tight sm:text-3xl min-w-0 break-words flex-1">
                  <span>{deck.name}</span>{" "}
                  {isOwner ? (
                    <Badge
                      variant="secondary"
                      className="inline-flex align-middle shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ml-2.5 -translate-y-0.5"
                    >
                      {cards.length}
                    </Badge>
                  ) : (
                    <button
                      type="button"
                      onClick={handleToggleStar}
                      disabled={isStarPending}
                      aria-label={isStarred ? t("unstarDeck") : t("starDeck")}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer shadow-sm shrink-0 ml-2.5 align-middle -translate-y-0.5",
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
                </h1>
              </div>

              <div className="hidden sm:flex items-center shrink-0">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleShareClick}
                  className="h-9 w-9 rounded-xl border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors shrink-0"
                  title={t("shareDeck")}
                  aria-label={t("shareDeck")}
                >
                  <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>
            </div>

            {(deck.created_at || deck.updated_at) && (
              <div className="mt-2.5 flex items-center gap-x-5 gap-y-1.5 flex-wrap text-xs text-muted-foreground">
                {deck.created_at && (
                  <span
                    className="inline-flex items-center gap-1.5"
                    title={formatDateTime(deck.created_at, locale)}
                  >
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
                    <span>
                      {t.rich("created", {
                        date: formatDate(deck.created_at, locale),
                        prefix: (chunks) => <span className="hidden sm:inline">{chunks}</span>,
                      })}
                    </span>
                  </span>
                )}
                {deck.updated_at && (
                  <span
                    className="inline-flex items-center gap-1.5"
                    title={formatDateTime(deck.updated_at, locale)}
                  >
                    <Clock className="h-3.5 w-3.5 text-muted-foreground/70" />
                    <span>
                      {t.rich("updated", {
                        time: formatRelativeTime(deck.updated_at, locale),
                        prefix: (chunks) => <span className="hidden sm:inline">{chunks}</span>,
                      })}
                    </span>
                  </span>
                )}
              </div>
            )}

            {deck.properties?.description && (
              <div className="mt-4 min-w-0">
                <p className="text-sm whitespace-pre-wrap break-all text-foreground/90">
                  {deck.properties.description}
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <Link
              href={
                parentFolder?.slug
                  ? `/${username}/${parentFolder.slug}`
                  : "/decks"
              }
              className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {parentFolder ? t("backTo", { name: parentFolder.name }) : t("backToDecks")}
            </Link>

            <Button
              variant="outline"
              size="icon"
              onClick={handleShareClick}
              className="h-9 w-9 rounded-xl border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors shrink-0 sm:hidden"
              title={t("shareDeck")}
              aria-label={t("shareDeck")}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <DeckActionButtons username={username} deckSlug={slug} />

        {/* Cards Section */}
        <div ref={cardsRef} id="cards" className="scroll-mt-6">
          <div className="mb-6 flex items-center justify-between gap-2">
            <h2 className="text-xl font-semibold">{t("cardsTitle")}</h2>
            <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:flex-nowrap">
              {isOwner && (
                <Button
                  variant="outline"
                  className="w-9 gap-2 rounded-xl border-border/80 px-0 font-medium sm:w-auto sm:px-3"
                  size="sm"
                  onClick={() => setShowTransposeDialog(true)}
                  title={t("swap")}
                >
                  <ArrowLeftRight className="h-4 w-4" />{" "}
                  <span className="hidden sm:inline">{t("swap")}</span>
                </Button>
              )}
              <Button
                variant="outline"
                className="w-9 gap-2 rounded-xl border-border/80 px-0 font-medium sm:w-auto sm:px-3"
                size="sm"
                onClick={() => setShowExportDialog(true)}
              >
                <Download className="h-4 w-4" />{" "}
                <span className="hidden sm:inline">{t("export")}</span>
              </Button>
              {isOwner && (
                <>
                  <Button
                    variant="outline"
                    className="w-9 gap-2 rounded-xl border-border/80 px-0 font-medium sm:w-auto sm:px-3"
                    size="sm"
                    onClick={() => setShowImportDialog(true)}
                  >
                    <Upload className="h-4 w-4" />{" "}
                    <span className="hidden sm:inline">{t("import")}</span>
                  </Button>
                  <Button
                    className="gap-2 rounded-xl font-medium"
                    size="sm"
                    onClick={() => setShowAddForm(!showAddForm)}
                  >
                    <Plus className="h-4 w-4" /> <span>{t("addCard")}</span>
                  </Button>
                </>
              )}
            </div>
          </div>

          {isOwner && showAddForm && (
            <AddCardForm
              newFront={newFront}
              setNewFront={setNewFront}
              newBack={newBack}
              setNewBack={setNewBack}
              isAddingCard={createCard.isPending}
              onAddCard={handleAddCard}
              onCancel={() => {
                setShowAddForm(false)
                setNewFront("")
                setNewBack("")
              }}
              onOpenFullEditor={() => setShowNewCardDialog(true)}
            />
          )}

          {/* Cards Table Header */}
          {cards.length > 0 && (
            <div className="mb-2 grid grid-cols-[auto_1fr_1fr_auto] items-center gap-3 px-4 py-2">
              <div className="w-10" />
              <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                {t("frontHeader")}
              </span>
              <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                {t("backHeader")}
              </span>
              <div className="w-16" />
            </div>
          )}

          {/* Cards List */}
          {cards.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center text-muted-foreground">
              <Layers className="mb-3 h-10 w-10 opacity-40" />
              <p className="mb-1 text-lg font-medium">{t("noCardsTitle")}</p>
              {isOwner && (
                <p className="text-sm">
                  {t("noCardsOwner")}
                </p>
              )}
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={cards.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {cards.map((card, index) => (
                    <SortableCardRow
                      key={card.id}
                      card={card}
                      index={index}
                      isOwner={isOwner}
                      editingCardId={editingCardId}
                      editFront={editFront}
                      editBack={editBack}
                      editFrontImage={editFrontImage}
                      editBackImage={editBackImage}
                      isSavingCard={
                        updateCard.isPending &&
                        updateCard.variables?.cardId === card.id
                      }
                      onStartEdit={handleStartEdit}
                      onCancelEdit={handleCancelEdit}
                      onSaveEdit={handleSaveEdit}
                      onOpenFullEdit={handleOpenFullEdit}
                      onDelete={handleDeleteCard}
                      onEditFrontChange={setEditFront}
                      onEditBackChange={setEditBack}
                      onImagePaste={(side, file) =>
                        handleImagePaste(card.id, side, file)
                      }
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        {editingCard && (
          <CardEditDialog
            card={editingCard}
            deckId={deck.id}
            onClose={() => setEditingCard(null)}
            onSave={(front, back) => {
              updateCard.mutate(
                { deckId: deck.id, cardId: editingCard.id, front, back },
                { onSuccess: () => setEditingCard(null) }
              )
            }}
            isSaving={updateCard.isPending}
          />
        )}

        {showNewCardDialog && (
          <NewCardDialog
            key={newCardDialogKey}
            deckId={deck.id}
            onClose={() => setShowNewCardDialog(false)}
            onSave={(front, back) => {
              createCard.mutate(
                { deckId: deck.id, front, back },
                { onSuccess: () => setShowNewCardDialog(false) }
              )
            }}
            onSaveAnother={(front, back) => {
              createCard.mutate(
                { deckId: deck.id, front, back },
                { onSuccess: () => setNewCardDialogKey((k) => k + 1) }
              )
            }}
            isSaving={createCard.isPending}
          />
        )}

        {showImportDialog && isOwner && (
          <DeckImportDialog
            mode="append"
            deckId={deck.id}
            onClose={() => setShowImportDialog(false)}
          />
        )}

        {showExportDialog && (
          <DeckExportDialog
            cards={cards}
            deckSlug={deck.slug || deck.id}
            onClose={() => setShowExportDialog(false)}
          />
        )}

        {showTransposeDialog && isOwner && (
          <ConfirmDialog
            open={showTransposeDialog}
            onOpenChange={setShowTransposeDialog}
            title={t("swapDialogTitle")}
            description={t("swapDialogDesc")}
            onConfirm={() => {
              transposeDeck.mutate({ deckId: deck.id })
            }}
            isPending={transposeDeck.isPending}
            confirmText={t("swapDialogConfirm")}
            destructive={false}
          />
        )}

        <ShareDeckDialog
          key={shareDeckTarget?.id ?? "closed-share-deck"}
          deck={shareDeckTarget}
          username={username}
          onClose={() => setShareDeckTarget(null)}
        />

        <GuestShareDialog
          open={guestShareOpen}
          onClose={() => setGuestShareOpen(false)}
        />

        <LegalLinks />
      </div>
    </div>
  )
}
