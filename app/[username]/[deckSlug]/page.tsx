'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { FlashCard, Deck } from '@/types';
import { SortableCardRow } from '@/components/cards/SortableCardRow';
import { AddCardForm } from '@/components/cards/AddCardForm';
import { DeckActionButtons } from '@/components/decks/DeckActionButtons';

export default function DeckPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const username = params.username as string;
  const deckSlug = params.deckSlug as string;

  const { user } = useAuth();

  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Editing state
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editFront, setEditFront] = useState('');
  const [editBack, setEditBack] = useState('');
  const [isSavingCard, setIsSavingCard] = useState(false);

  // New card state
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const cardsRef = useRef<HTMLDivElement>(null);

  const isOwner = !!(user && deck && user.id === deck.user_id && !user.is_guest);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Fetch deck and cards
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch deck by username and slug
        const deckRes = await apiFetch(`/api/v1/users/profile/${username}/decks/${deckSlug}`);
        if (!deckRes.ok) {
          if (deckRes.status === 404) setError('Deck not found');
          else if (deckRes.status === 403) setError('You do not have permission to view this deck');
          else setError('Failed to load deck');
          return;
        }
        const deckData = await deckRes.json();
        setDeck(deckData);

        // Fetch cards
        const cardsRes = await apiFetch(`/api/v1/decks/${deckData.id}/cards`);
        if (cardsRes.ok) {
          const cardsData = await cardsRes.json();
          setCards(cardsData.sort((a: FlashCard, b: FlashCard) => a.order - b.order));
        }
      } catch {
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (username && deckSlug) fetchData();
  }, [username, deckSlug]);

  // Scroll to cards section if ?edit=true
  useEffect(() => {
    if (!loading && searchParams.get('edit') === 'true' && cardsRef.current) {
      cardsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [loading, searchParams]);

  // --- Card Editing ---

  const handleStartEdit = useCallback((card: FlashCard) => {
    setEditingCardId(card.id);
    setEditFront(card.front.map((el) => el.content).join(' '));
    setEditBack(card.back.map((el) => el.content).join(' '));
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingCardId(null);
    setEditFront('');
    setEditBack('');
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editingCardId || !deck) return;
    setIsSavingCard(true);
    try {
      const res = await apiFetch(`/api/v1/decks/${deck.id}/cards/${editingCardId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          front: [{ type: 'text', content: editFront }],
          back: [{ type: 'text', content: editBack }],
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setCards((prev) => prev.map((c) => (c.id === editingCardId ? updated : c)));
        setEditingCardId(null);
        setEditFront('');
        setEditBack('');
      }
    } catch {
      // silently fail
    } finally {
      setIsSavingCard(false);
    }
  }, [editingCardId, deck, editFront, editBack]);

  // --- Add Card ---

  const handleAddCard = async () => {
    if (!deck || !newFront.trim()) return;
    setIsAddingCard(true);
    try {
      const res = await apiFetch(`/api/v1/decks/${deck.id}/cards`, {
        method: 'POST',
        body: JSON.stringify({
          front: [{ type: 'text', content: newFront }],
          back: [{ type: 'text', content: newBack }],
        }),
      });
      if (res.ok) {
        const newCard = await res.json();
        setCards((prev) => [...prev, newCard]);
        setNewFront('');
        setNewBack('');
      }
    } catch {
      // silently fail
    } finally {
      setIsAddingCard(false);
    }
  };

  // --- Delete Card ---

  const handleDeleteCard = async (cardId: string) => {
    if (!deck) return;
    try {
      const res = await apiFetch(`/api/v1/decks/${deck.id}/cards/${cardId}`, {
        method: 'DELETE',
      });
      if (res.ok || res.status === 204) {
        setCards((prev) => prev.filter((c) => c.id !== cardId));
        if (editingCardId === cardId) handleCancelEdit();
      }
    } catch {
      // silently fail
    }
  };

  // --- Reorder ---

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !deck) return;

    const oldIndex = cards.findIndex((c) => c.id === active.id);
    const newIndex = cards.findIndex((c) => c.id === over.id);

    const reordered = arrayMove(cards, oldIndex, newIndex);
    setCards(reordered);

    // Persist reorder
    try {
      await apiFetch(`/api/v1/decks/${deck.id}/cards/reorder`, {
        method: 'POST',
        body: JSON.stringify({
          card_ids: reordered.map((c) => c.id),
        }),
      });
    } catch {
      // Revert on failure
      setCards(cards);
    }
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

  if (error || !deck) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 mt-20">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
          <h2 className="font-bold text-2xl mb-4">{error || 'Deck not found'}</h2>
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
          href={`/${username}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {username}
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
            isAddingCard={isAddingCard}
            onAddCard={handleAddCard}
            onCancel={() => {
              setShowAddForm(false);
              setNewFront('');
              setNewBack('');
            }}
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
                    isSavingCard={isSavingCard}
                    onStartEdit={handleStartEdit}
                    onCancelEdit={handleCancelEdit}
                    onSaveEdit={handleSaveEdit}
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
    </div>
  );
}
