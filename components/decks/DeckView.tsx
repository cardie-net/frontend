"use client"

import { useState, useRef, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/AuthContext"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, ArrowLeft, Plus, Layers, Upload, Download } from "lucide-react"
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
import { DeckActionButtons } from "@/components/decks/DeckActionButtons"
import { DeckImportDialog } from "@/components/decks/DeckImportDialog"
import { DeckExportDialog } from "@/components/decks/DeckExportDialog"
import {
  useCards,
  useCreateCard,
  useUpdateCard,
  useDeleteCard,
  useReorderCards,
} from "@/hooks/useCards"
import { buildElements, getCardImage, getCardText } from "@/lib/cards"

interface DeckViewProps {
  username: string
  slug: string
  deck: Deck
}

export function DeckView({ username, slug, deck }: DeckViewProps) {
  const searchParams = useSearchParams()
  const { user } = useAuth()

  const { data: cards = [], isLoading: cardsLoading } = useCards(deck.id)

  const createCard = useCreateCard()
  const updateCard = useUpdateCard()
  const deleteCard = useDeleteCard()
  const reorderCards = useReorderCards()

  // Popup (full) edit state
  const [editingCard, setEditingCard] = useState<FlashCard | null>(null)
  const [showNewCardDialog, setShowNewCardDialog] = useState(false)
  // Incremented after "Save & add another" to remount the dialog with fresh empty fields.
  const [newCardDialogKey, setNewCardDialogKey] = useState(0)

  // Inline edit state
  const [editingCardId, setEditingCardId] = useState<string | null>(null)
  const [editFront, setEditFront] = useState("")
  const [editBack, setEditBack] = useState("")

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

  const cardsRef = useRef<HTMLDivElement>(null)

  const isOwner = !!(user && deck && user.id === deck.user_id && !user.is_guest)

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // Scroll to cards section if ?edit=true
  useEffect(() => {
    if (!cardsLoading && searchParams.get("edit") === "true" && cardsRef.current) {
      cardsRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [cardsLoading, searchParams])

  // --- Card Editing ---

  // Simple click on the card starts inline editing (fast path).
  const handleStartEdit = (card: FlashCard) => {
    setEditingCardId(card.id)
    setEditFront(getCardText(card.front))
    setEditBack(getCardText(card.back))
  }

  const handleCancelEdit = () => {
    setEditingCardId(null)
    setEditFront("")
    setEditBack("")
  }

  const handleSaveEdit = () => {
    if (!editingCardId || !deck) return
    const cardIdToSave = editingCardId
    // Preserve any image elements the card already has on each side.
    const card = cards.find((c) => c.id === cardIdToSave)
    const frontImage = card ? (getCardImage(card.front)?.url ?? null) : null
    const backImage = card ? (getCardImage(card.back)?.url ?? null) : null
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
        },
      }
    )
  }

  // Escalate from inline editing to the full popup editor.
  const handleOpenFullEdit = (card: FlashCard) => {
    handleCancelEdit()
    setEditingCard(card)
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
    <div className="flex flex-col w-full">
      {deck.properties?.cover_image_url && (
        <div className="w-full aspect-[4/1] max-h-56 sm:max-h-72 bg-muted">
          <img 
            src={deck.properties.cover_image_url} 
            alt={`${deck.name} cover`}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className={cn(
        "container mx-auto max-w-4xl px-4 pb-8 sm:px-10 sm:pb-16 space-y-8",
        deck.properties?.cover_image_url ? "pt-6 sm:pt-8" : "pt-8 sm:pt-16"
      )}>
      {/* Header */}
      <div className="flex flex-col">

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{deck.name}</h1>
        {deck.properties?.description && (
          <p className="mt-2 text-sm sm:text-base text-foreground/90 whitespace-pre-wrap">
            {deck.properties.description}
          </p>
        )}
        <p className="mt-1 text-sm text-muted-foreground">
          {cards.length} {cards.length === 1 ? "card" : "cards"}
        </p>
      </div>

      <Link
        href="/decks"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground w-fit"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Decks
      </Link>

      <DeckActionButtons username={username} deckSlug={slug} />

      {/* Cards Section */}
      <div ref={cardsRef} id="cards" className="scroll-mt-6">
        <div className="mb-6 flex items-center justify-between gap-2">
          <h2 className="text-xl font-semibold">Cards</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExportDialog(true)}
            >
              <Download className="mr-1.5 h-4 w-4" />
              Export
            </Button>
            {isOwner && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowImportDialog(true)}
                >
                  <Upload className="mr-1.5 h-4 w-4" />
                  Import
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddForm(!showAddForm)}
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  Add Card
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
              Front
            </span>
            <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              Back
            </span>
            <div className="w-16" />
          </div>
        )}

        {/* Cards List */}
        {cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center text-muted-foreground">
            <Layers className="mb-3 h-10 w-10 opacity-40" />
            <p className="mb-1 text-lg font-medium">No cards yet</p>
            {isOwner && (
              <p className="text-sm">
                Click &ldquo;Add Card&rdquo; to create your first flashcard.
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
    </div>
    </div>
  )
}
