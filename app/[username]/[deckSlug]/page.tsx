'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, ArrowLeft, Plus, Layers } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { FlashCard } from '@/types';
import { SortableCardRow } from '@/components/cards/SortableCardRow';
import { AddCardForm } from '@/components/cards/AddCardForm';
import { CardEditDialog, NewCardDialog } from '@/components/cards/CardEditDialog';
import { DeckActionButtons } from '@/components/decks/DeckActionButtons';
import { useDeck } from '@/hooks/useDecks';
import { useCards, useCreateCard, useUpdateCard, useDeleteCard, useReorderCards } from '@/hooks/useCards';
import { buildElements, getCardImage, getCardText } from '@/lib/cards';

export default function DeckPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const username = params.username as string;
  const deckSlug = params.deckSlug as string;

  const { user } = useAuth();

  const { data: deck, isLoading: deckLoading, error: deckError } = useDeck(username, deckSlug);
  const { data: cards = [], isLoading: cardsLoading } = useCards(deck?.id);
  
  const createCard = useCreateCard();
  const updateCard = useUpdateCard();
  const deleteCard = useDeleteCard();
  const reorderCards = useReorderCards();

  const loading = deckLoading || (!!deck && cardsLoading);

  // Popup (full) edit state
  const [editingCard, setEditingCard] = useState<FlashCard | null>(null);
  const [showNewCardDialog, setShowNewCardDialog] = useState(false);
  // Incremented after "Save & add another" to remount the dialog with fresh empty fields.
  const [newCardDialogKey, setNewCardDialogKey] = useState(0);

  // Inline edit state
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editFront, setEditFront] = useState('');
  const [editBack, setEditBack] = useState('');

  // Latest editingCardId, readable from async callbacks (e.g. auto-save on blur).
  const editingCardIdRef = useRef<string | null>(null);
  useEffect(() => {
    editingCardIdRef.current = editingCardId;
  }, [editingCardId]);

  // New card state
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const cardsRef = useRef<HTMLDivElement>(null);

  const isOwner = !!(user && deck && user.id === deck.user_id && !user.is_guest);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Scroll to cards section if ?edit=true
  useEffect(() => {
    if (!loading && searchParams.get('edit') === 'true' && cardsRef.current) {
      cardsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [loading, searchParams]);

  // --- Card Editing ---

  // Simple click on the card starts inline editing (fast path).
  const handleStartEdit = (card: FlashCard) => {
    setEditingCardId(card.id);
    setEditFront(getCardText(card.front));
    setEditBack(getCardText(card.back));
  };

  const handleCancelEdit = () => {
    setEditingCardId(null);
    setEditFront('');
    setEditBack('');
  };

  const handleSaveEdit = () => {
    if (!editingCardId || !deck) return;
    const cardIdToSave = editingCardId;
    // Preserve any image elements the card already has on each side.
    const card = cards.find((c) => c.id === cardIdToSave);
    const frontImage = card ? (getCardImage(card.front)?.url ?? null) : null;
    const backImage = card ? (getCardImage(card.back)?.url ?? null) : null;
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
          if (editingCardIdRef.current !== cardIdToSave) return;
          setEditingCardId(null);
          setEditFront('');
          setEditBack('');
        },
      }
    );
  };

  // Escalate from inline editing to the full popup editor.
  const handleOpenFullEdit = (card: FlashCard) => {
    handleCancelEdit();
    setEditingCard(card);
  };

  // --- Add Card ---

  const handleAddCard = async () => {
    if (!deck || !newFront.trim()) return;
    createCard.mutate({
      deckId: deck.id,
      front: [{ type: 'text', content: newFront }],
      back: [{ type: 'text', content: newBack }],
    }, {
      onSuccess: () => {
        setNewFront('');
        setNewBack('');
      }
    });
  };

  // --- Delete Card ---

  const handleDeleteCard = (cardId: string) => {
    if (!deck) return;
    deleteCard.mutate({ deckId: deck.id, cardId });
    if (editingCardId === cardId) handleCancelEdit();
    if (editingCard?.id === cardId) setEditingCard(null);
  };

  // --- Reorder ---

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !deck) return;

    const oldIndex = cards.findIndex((c) => c.id === active.id);
    const newIndex = cards.findIndex((c) => c.id === over.id);

    // Create a new array with the dragged item moved
    const newCards = [...cards];
    const [movedItem] = newCards.splice(oldIndex, 1);
    newCards.splice(newIndex, 0, movedItem);

    reorderCards.mutate({
      deckId: deck.id,
      orderedIds: newCards.map(c => c.id)
    });
  };

  // --- Loading State ---

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-5xl space-y-8">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  // --- Error State ---

  if (deckError || !deck) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 mt-20">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
          <h2 className="font-bold text-2xl mb-4">{deckError?.message || 'Deck not found'}</h2>
          <Link href={`/${username}`}>
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to profile
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/decks"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          My Decks
        </Link>
        <h1 className="text-3xl font-bold">{deck.name}</h1>
        <p className="text-muted-foreground mt-1">
          {cards.length} {cards.length === 1 ? 'card' : 'cards'}
        </p>
      </div>

      <DeckActionButtons username={username} deckSlug={deckSlug} />

      {/* Cards Section */}
      <div ref={cardsRef} id="cards" className="scroll-mt-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Cards</h2>
          {isOwner && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Card
            </Button>
          )}
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
              setShowAddForm(false);
              setNewFront('');
              setNewBack('');
            }}
            onOpenFullEditor={() => setShowNewCardDialog(true)}
          />
        )}

        {/* Cards Table Header */}
        {cards.length > 0 && (
          <div className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-3 px-4 py-2 mb-2">
            <div className="w-10" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Front
            </span>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Back
            </span>
            <div className="w-16" />
          </div>
        )}

        {/* Cards List */}
        {cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-2xl text-center text-muted-foreground">
            <Layers className="w-10 h-10 mb-3 opacity-40" />
            <p className="font-medium text-lg mb-1">No cards yet</p>
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
                    isSavingCard={updateCard.isPending && updateCard.variables?.cardId === card.id}
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
            );
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
            );
          }}
          onSaveAnother={(front, back) => {
            createCard.mutate(
              { deckId: deck.id, front, back },
              { onSuccess: () => setNewCardDialogKey((k) => k + 1) }
            );
          }}
          isSaving={createCard.isPending}
        />
      )}
    </div>
  );
}
