'use client';

import { useState, type ReactNode } from 'react';
import { Loader2, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MarkdownEditor } from '@/components/cards/MarkdownEditor';
import { buildElements, getCardImage, getCardText } from '@/lib/cards';
import { CardElement, FlashCard } from '@/types';

interface EditorDialogShellProps {
  title: string;
  description: string;
  deckId: string;
  front: string;
  back: string;
  frontImage: string | null;
  backImage: string | null;
  onFrontChange: (value: string) => void;
  onBackChange: (value: string) => void;
  onFrontImageChange: (url: string | null) => void;
  onBackImageChange: (url: string | null) => void;
  isDirty: boolean;
  onClose: () => void;
  onSave: () => void;
  /** Optional second save action (e.g. "save & add another" in create mode). */
  onSaveAnother?: () => void;
  /** Label of the primary save button. */
  saveLabel?: string;
  isSaving: boolean;
  children?: ReactNode;
}

/**
 * Shared popup shell: two side-by-side markdown fields (front/back) with
 * formatting toolbars, one separate image per side, Save/Cancel + dirty check.
 * These dialogs are mounted only while open, so state initializers are fresh.
 */
function EditorDialogShell({
  title,
  description,
  deckId,
  front,
  back,
  frontImage,
  backImage,
  onFrontChange,
  onBackChange,
  onFrontImageChange,
  onBackImageChange,
  isDirty,
  onClose,
  onSave,
  onSaveAnother,
  saveLabel = 'Save',
  isSaving,
  children,
}: EditorDialogShellProps) {
  const handleOpenChange = (open: boolean) => {
    if (!open && isDirty && !window.confirm('Discard unsaved changes?')) return;
    onClose();
  };

  return (
    <Dialog open onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[min(90vw,58rem)]" showCloseButton={false}>
        <DialogHeader className="flex flex-row items-center gap-3 space-y-0 text-left">
            <div className="p-2 rounded-2xl bg-primary/10 text-primary">
              <Pencil className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">{title}</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {description}
              </DialogDescription>
            </div>
          </DialogHeader>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <MarkdownEditor
            label="Front"
            value={front}
            onChange={onFrontChange}
            deckId={deckId}
            imageUrl={frontImage}
            onImageUrlChange={onFrontImageChange}
            placeholder="Question or term"
          />
          <MarkdownEditor
            label="Back"
            value={back}
            onChange={onBackChange}
            deckId={deckId}
            imageUrl={backImage}
            onImageUrlChange={onBackImageChange}
            placeholder="Answer or definition"
          />
        </div>

        {children}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          {onSaveAnother && (
            <Button variant="secondary" onClick={onSaveAnother} disabled={isSaving}>
              Save & add another
            </Button>
          )}
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saveLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface CardEditDialogProps {
  /** The card being edited (the dialog is mounted only while open). */
  card: FlashCard;
  deckId: string;
  onClose: () => void;
  onSave: (front: CardElement[], back: CardElement[]) => void;
  isSaving: boolean;
}

/** Full popup editor for an existing card. */
export function CardEditDialog({ card, deckId, onClose, onSave, isSaving }: CardEditDialogProps) {
  const [front, setFront] = useState(() => getCardText(card.front));
  const [back, setBack] = useState(() => getCardText(card.back));
  const [frontImage, setFrontImage] = useState<string | null>(() => getCardImage(card.front)?.url ?? null);
  const [backImage, setBackImage] = useState<string | null>(() => getCardImage(card.back)?.url ?? null);

  const isDirty =
    front !== getCardText(card.front) ||
    back !== getCardText(card.back) ||
    frontImage !== (getCardImage(card.front)?.url ?? null) ||
    backImage !== (getCardImage(card.back)?.url ?? null);

  return (
    <EditorDialogShell
      title="Edit card"
      description="Front and back support markdown formatting. Each side can hold one image, shown separately."
      deckId={deckId}
      front={front}
      back={back}
      frontImage={frontImage}
      backImage={backImage}
      onFrontChange={setFront}
      onBackChange={setBack}
      onFrontImageChange={setFrontImage}
      onBackImageChange={setBackImage}
      isDirty={isDirty}
      onClose={onClose}
      onSave={() => onSave(buildElements(front, frontImage), buildElements(back, backImage))}
      isSaving={isSaving}
    />
  );
}

interface NewCardDialogProps {
  deckId: string;
  onClose: () => void;
  /** Save the card and close the dialog. */
  onSave: (front: CardElement[], back: CardElement[]) => void;
  /** Save the card and start a fresh, empty one (create mode only). */
  onSaveAnother?: (front: CardElement[], back: CardElement[]) => void;
  isSaving: boolean;
}

/** Full popup editor for creating a new card (starts empty). */
export function NewCardDialog({ deckId, onClose, onSave, onSaveAnother, isSaving }: NewCardDialogProps) {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);

  const isDirty = front !== '' || back !== '' || frontImage !== null || backImage !== null;

  return (
    <EditorDialogShell
      title="Add card"
      description="Front and back support markdown formatting. Each side can hold one image, shown separately."
      deckId={deckId}
      front={front}
      back={back}
      frontImage={frontImage}
      backImage={backImage}
      onFrontChange={setFront}
      onBackChange={setBack}
      onFrontImageChange={setFrontImage}
      onBackImageChange={setBackImage}
      isDirty={isDirty}
      onClose={onClose}
      onSave={() => onSave(buildElements(front, frontImage), buildElements(back, backImage))}
      onSaveAnother={
        onSaveAnother
          ? () => onSaveAnother(buildElements(front, frontImage), buildElements(back, backImage))
          : undefined
      }
      saveLabel="Save & close"
      isSaving={isSaving}
    />
  );
}
