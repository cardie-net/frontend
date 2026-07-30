'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  GraduationCap,
  Clock,
  FileCheck,
  Layers,
  Plus,
  GripVertical,
  Pencil,
  Trash2,
  Check,
  X,
  Loader2,
} from 'lucide-react';
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
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Types ---

interface CardElement {
  type: 'text';
  content: string;
}

interface FlashCard {
  id: string;
  front: CardElement[];
  back: CardElement[];
  order: number;
  deck_id: string;
}

interface Deck {
  id: string;
  name: string;
  slug: string;
  user_id: string;
  privacy: string;
  properties?: {
    color?: string;
  };
}

// --- Action Buttons Config ---

const ACTION_BUTTONS = [
  {
    label: 'Overview',
    icon: BarChart3,
    href: 'overview',
    gradient: 'from-violet-500/15 to-purple-500/15',
    hoverGradient: 'from-violet-500/25 to-purple-500/25',
    iconColor: 'text-violet-500',
  },
  {
    label: 'Learn',
    icon: GraduationCap,
    href: 'learn',
    gradient: 'from-blue-500/15 to-cyan-500/15',
    hoverGradient: 'from-blue-500/25 to-cyan-500/25',
    iconColor: 'text-blue-500',
  },
  {
    label: 'Spaced Repetition',
    icon: Clock,
    href: 'spaced-repetition',
    gradient: 'from-emerald-500/15 to-teal-500/15',
    hoverGradient: 'from-emerald-500/25 to-teal-500/25',
    iconColor: 'text-emerald-500',
  },
  {
    label: 'Exam',
    icon: FileCheck,
    href: 'exam',
    gradient: 'from-amber-500/15 to-orange-500/15',
    hoverGradient: 'from-amber-500/25 to-orange-500/25',
    iconColor: 'text-amber-500',
  },
  {
    label: 'Match',
    icon: Layers,
    href: 'match',
    gradient: 'from-pink-500/15 to-rose-500/15',
    hoverGradient: 'from-pink-500/25 to-rose-500/25',
    iconColor: 'text-pink-500',
  },
];

// --- Sortable Card Row ---

function SortableCardRow({
  card,
  index,
  isOwner,
  editingCardId,
  editFront,
  editBack,
  isSavingCard,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onEditFrontChange,
  onEditBackChange,
}: {
  card: FlashCard;
  index: number;
  isOwner: boolean;
  editingCardId: string | null;
  editFront: string;
  editBack: string;
  isSavingCard: boolean;
  onStartEdit: (card: FlashCard) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onDelete: (cardId: string) => void;
  onEditFrontChange: (value: string) => void;
  onEditBackChange: (value: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id, disabled: !isOwner });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isEditing = editingCardId === card.id;
  const frontText = card.front.map((el) => el.content).join(' ');
  const backText = card.back.map((el) => el.content).join(' ');

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group grid grid-cols-[auto_1fr_1fr_auto] items-center gap-3 rounded-xl border bg-card px-4 py-3 transition-all duration-200',
        isDragging && 'z-50 shadow-xl ring-2 ring-primary/30 opacity-90',
        !isDragging && 'hover:shadow-sm',
        isEditing && 'ring-2 ring-primary/20 bg-accent/30'
      )}
    >
      {/* Drag handle */}
      <div
        className={cn(
          'flex items-center gap-2',
          isOwner ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
        )}
        {...(isOwner ? { ...attributes, ...listeners } : {})}
      >
        {isOwner && (
          <GripVertical className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
        )}
        <span className="text-xs text-muted-foreground font-mono w-6 text-right tabular-nums">
          {index + 1}
        </span>
      </div>

      {/* Front */}
      <div className="min-w-0">
        {isEditing ? (
          <Input
            value={editFront}
            onChange={(e) => onEditFrontChange(e.target.value)}
            className="text-sm"
            placeholder="Front of card"
            disabled={isSavingCard}
            autoFocus
          />
        ) : (
          <button
            type="button"
            onClick={() => isOwner && onStartEdit(card)}
            className={cn(
              'w-full text-left text-sm py-1.5 px-2 rounded-md truncate transition-colors',
              isOwner && 'hover:bg-accent/50 cursor-text'
            )}
            disabled={!isOwner}
          >
            {frontText || <span className="text-muted-foreground italic">Empty</span>}
          </button>
        )}
      </div>

      {/* Back */}
      <div className="min-w-0">
        {isEditing ? (
          <Input
            value={editBack}
            onChange={(e) => onEditBackChange(e.target.value)}
            className="text-sm"
            placeholder="Back of card"
            disabled={isSavingCard}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSaveEdit();
              if (e.key === 'Escape') onCancelEdit();
            }}
          />
        ) : (
          <button
            type="button"
            onClick={() => isOwner && onStartEdit(card)}
            className={cn(
              'w-full text-left text-sm py-1.5 px-2 rounded-md truncate transition-colors',
              isOwner && 'hover:bg-accent/50 cursor-text'
            )}
            disabled={!isOwner}
          >
            {backText || <span className="text-muted-foreground italic">Empty</span>}
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {isEditing ? (
          <>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onSaveEdit}
              disabled={isSavingCard}
              className="text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10"
            >
              {isSavingCard ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onCancelEdit}
              disabled={isSavingCard}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </>
        ) : isOwner ? (
          <>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onStartEdit(card)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onDelete(card.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
}

// --- Main Page ---

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

      {/* Action Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-12">
        {ACTION_BUTTONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={`/${username}/${deckSlug}/${action.href}`}
              className="block"
            >
              <div
                className={cn(
                  'group relative flex flex-col items-center justify-center gap-3 rounded-2xl border p-6 aspect-square transition-all duration-300',
                  'bg-gradient-to-br hover:shadow-lg hover:-translate-y-0.5',
                  action.gradient,
                  `hover:${action.hoverGradient}`
                )}
              >
                <div
                  className={cn(
                    'rounded-xl p-3 transition-transform duration-300 group-hover:scale-110',
                    action.iconColor
                  )}
                >
                  <Icon className="w-7 h-7" strokeWidth={1.75} />
                </div>
                <span className="text-sm font-medium text-center leading-tight">
                  {action.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

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

        {/* Add Card Form */}
        {isOwner && showAddForm && (
          <Card className="mb-6 border-dashed">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                    Front
                  </label>
                  <Input
                    value={newFront}
                    onChange={(e) => setNewFront(e.target.value)}
                    placeholder="Question or term"
                    disabled={isAddingCard}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                    Back
                  </label>
                  <Input
                    value={newBack}
                    onChange={(e) => setNewBack(e.target.value)}
                    placeholder="Answer or definition"
                    disabled={isAddingCard}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddCard();
                    }}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewFront('');
                    setNewBack('');
                  }}
                  disabled={isAddingCard}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleAddCard}
                  disabled={isAddingCard || !newFront.trim()}
                >
                  {isAddingCard ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-1.5" />
                      Add
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
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
