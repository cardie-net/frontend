'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Loader2, Maximize } from 'lucide-react';

interface AddCardFormProps {
  newFront: string;
  setNewFront: (val: string) => void;
  newBack: string;
  setNewBack: (val: string) => void;
  isAddingCard: boolean;
  onAddCard: () => void;
  onCancel: () => void;
  /** Opens the full popup editor for creating a new card. */
  onOpenFullEditor: () => void;
}

export function AddCardForm({
  newFront,
  setNewFront,
  newBack,
  setNewBack,
  isAddingCard,
  onAddCard,
  onCancel,
  onOpenFullEditor,
}: AddCardFormProps) {
  return (
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
                if (e.key === 'Enter') onAddCard();
              }}
            />
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenFullEditor}
            disabled={isAddingCard}
          >
            <Maximize className="w-4 h-4 mr-1.5" />
            Full editor
          </Button>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={isAddingCard}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={onAddCard}
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
        </div>
      </CardContent>
    </Card>
  );
}
