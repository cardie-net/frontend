'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { GripVertical, Pencil, Trash2, Check, X, Loader2 } from 'lucide-react';
import { FlashCard } from '@/types';

interface SortableCardRowProps {
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
}

export function SortableCardRow({
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
}: SortableCardRowProps) {
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
