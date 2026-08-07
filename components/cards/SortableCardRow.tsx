'use client';

import { useEffect, useRef, useState, type FocusEvent } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { GripVertical, Maximize, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import { CardElement, FlashCard, TextElement } from '@/types';
import { getCardImage } from '@/lib/cards';
import { CardElements } from '@/components/cards/CardElements';
import { FullscreenImageViewer } from '@/components/shared/FullscreenImageViewer';

/** Thumbnail with fullscreen preview capability */
function RowCellImage({ url, interactive = true }: { url: string; interactive?: boolean }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleOpen = (e: React.MouseEvent) => {
    if (!interactive) return;
    e.preventDefault();
    e.stopPropagation();
    setIsFullscreen(true);
  };

  return (
    <>
      <div 
        className={cn(
          "relative h-8 w-8 shrink-0 overflow-hidden rounded-md border flex-shrink-0",
          interactive ? "group/image cursor-pointer" : ""
        )}
        onClick={handleOpen}
      >
        <img
          src={url}
          alt=""
          className={cn(
            "h-full w-full object-cover transition-all duration-200",
            interactive && "group-hover/image:blur-sm"
          )}
        />
        {interactive && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity duration-200 bg-black/20">
            <Maximize className="h-4 w-4 text-white drop-shadow-md" />
          </div>
        )}
      </div>
      {interactive && (
        <FullscreenImageViewer 
          src={url} 
          isOpen={isFullscreen} 
          onClose={() => setIsFullscreen(false)} 
        />
      )}
    </>
  );
}

/** Mini preview for the card list: small thumbnail to the left of compact markdown text. */
function RowCell({ elements }: { elements: CardElement[] }) {
  const image = getCardImage(elements);
  const texts = elements.filter((el): el is TextElement => el.type === 'text');
  return (
    <div className="flex min-w-0 items-center gap-2">
      {image && <RowCellImage url={image.url} />}
      {texts.length > 0 ? (
        <div className="min-w-0 flex-1 overflow-hidden">
          <CardElements elements={texts} compact className="space-y-0" />
        </div>
      ) : (
        !image && <span className="text-muted-foreground italic">Empty</span>
      )}
    </div>
  );
}

interface SortableCardRowProps {
  card: FlashCard;
  index: number;
  isOwner: boolean;
  editingCardId: string | null;
  editFront: string;
  editBack: string;
  editFrontImage: string | null;
  editBackImage: string | null;
  isSavingCard: boolean;
  onStartEdit: (card: FlashCard) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onOpenFullEdit: (card: FlashCard) => void;
  onDelete: (cardId: string) => void;
  onEditFrontChange: (value: string) => void;
  onEditBackChange: (value: string) => void;
  onImagePaste: (side: 'front' | 'back', file: File) => void;
}

export function SortableCardRow({
  card,
  index,
  isOwner,
  editingCardId,
  editFront,
  editBack,
  editFrontImage,
  editBackImage,
  isSavingCard,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onOpenFullEdit,
  onDelete,
  onEditFrontChange,
  onEditBackChange,
  onImagePaste,
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

  const containerRef = useRef<HTMLDivElement | null>(null);
  const discardingRef = useRef(false);

  const isEditing = editingCardId === card.id;

  // Reset the "discard in progress" flag whenever this row enters edit mode.
  useEffect(() => {
    if (isEditing) discardingRef.current = false;
  }, [isEditing]);

  // Changes are saved by default when the user clicks away from editing (blur).
  // Skipped when focus moves within this row (e.g. to the discard / full-edit buttons).
  const handleInputBlur = (e: FocusEvent<HTMLInputElement>) => {
    const wasDiscarding = discardingRef.current;
    discardingRef.current = false;
    if (wasDiscarding) return;
    const related = e.relatedTarget as Node | null;
    if (related && containerRef.current?.contains(related)) return;
    onSaveEdit();
  };

  const handlePaste = (side: 'front' | 'back') => (e: React.ClipboardEvent<HTMLInputElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.kind === 'file' && item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          onImagePaste(side, file);
        }
        return;
      }
    }
  };

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        containerRef.current = node;
      }}
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
          <div className="flex min-w-0 items-center gap-2">
            {editFrontImage && <RowCellImage url={editFrontImage} interactive={false} />}
            <Input
              value={editFront}
              onChange={(e) => onEditFrontChange(e.target.value)}
              className="text-sm"
              placeholder="Front of card"
              disabled={isSavingCard}
              autoFocus
              onBlur={handleInputBlur}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSaveEdit();
                if (e.key === 'Escape') onCancelEdit();
              }}
              onPaste={handlePaste('front')}
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => isOwner && onStartEdit(card)}
            className={cn(
              'w-full text-left text-sm py-1.5 px-2 rounded-md transition-colors',
              isOwner && 'hover:bg-accent/50 cursor-text'
            )}
            disabled={!isOwner}
          >
            <RowCell elements={card.front} />
          </button>
        )}
      </div>

      {/* Back */}
      <div className="min-w-0">
        {isEditing ? (
          <div className="flex min-w-0 items-center gap-2">
            {editBackImage && <RowCellImage url={editBackImage} interactive={false} />}
            <Input
              value={editBack}
              onChange={(e) => onEditBackChange(e.target.value)}
              className="text-sm"
              placeholder="Back of card"
              disabled={isSavingCard}
              onBlur={handleInputBlur}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSaveEdit();
                if (e.key === 'Escape') onCancelEdit();
              }}
              onPaste={handlePaste('back')}
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => isOwner && onStartEdit(card)}
            className={cn(
              'w-full text-left text-sm py-1.5 px-2 rounded-md transition-colors',
              isOwner && 'hover:bg-accent/50 cursor-text'
            )}
            disabled={!isOwner}
          >
            <RowCell elements={card.back} />
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
              onMouseDown={() => {
                discardingRef.current = true;
              }}
              onClick={() => onOpenFullEdit(card)}
              disabled={isSavingCard}
              aria-label="Open full editor"
              title="Open full editor"
              className="text-muted-foreground hover:text-foreground"
            >
              <Maximize className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onMouseDown={() => {
                discardingRef.current = true;
              }}
              onClick={onCancelEdit}
              disabled={isSavingCard}
              aria-label="Discard changes"
              title="Discard changes"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              {isSavingCard ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <X className="w-3.5 h-3.5" />
              )}
            </Button>
          </>
        ) : isOwner ? (
          <>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onOpenFullEdit(card)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
              aria-label="Edit card"
              title="Edit card"
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onDelete(card.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              aria-label="Delete card"
              title="Delete card"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
}
