'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Plus } from 'lucide-react';
import { Deck } from '@/types';
import { CreateDeckDialog } from '@/components/decks/CreateDeckDialog';
import { ShareDeckDialog } from '@/components/decks/ShareDeckDialog';
import { DeckCard } from '@/components/decks/DeckCard';
import { useDecks, useDeleteDeck } from '@/hooks/useDecks';

export default function DecksPage() {
  const { user, loading: authLoading } = useAuth();
  
  const { data: decks = [], isLoading: decksLoading, error: decksError } = useDecks();
  const deleteDeck = useDeleteDeck();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [shareDeckTarget, setShareDeckTarget] = useState<Deck | null>(null);

  const handleDeleteDeck = (deckId: string) => {
    if (!confirm('Are you sure you want to delete this deck? All cards will be lost.')) return;
    deleteDeck.mutate(deckId);
  };

  const handleUpdateDeck = (updatedDeck: Deck) => {
    // Optionally update local state here, but best to rely on React Query invalidation in ShareDeckDialog
    // For now, since ShareDeckDialog isn't using React Query yet, we can leave this as a prop
    // Actually, ShareDeckDialog should invalidate the query.
  };

  if (authLoading || decksLoading) {
    return <div className="p-8">Loading decks...</div>;
  }

  if (!user || user.is_guest) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p>Please log in to view your decks.</p>
        <Link href="/login">
          <Button>Log In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Decks</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 w-4 h-4" /> New Deck
        </Button>
      </div>

      {decksError && <Alert variant="destructive" className="mb-6">{decksError.message}</Alert>}
      {deleteDeck.error && <Alert variant="destructive" className="mb-6">{deleteDeck.error.message}</Alert>}

      {decks.length === 0 ? (
        <div className="text-center p-12 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground mb-4">You don&apos;t have any decks yet.</p>
          <Button onClick={() => setIsCreateDialogOpen(true)} variant="outline">
            Create your first deck
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map((deck) => (
            <DeckCard
              key={deck.id}
              deck={deck}
              username={user.username}
              onShare={setShareDeckTarget}
              onDelete={handleDeleteDeck}
            />
          ))}
        </div>
      )}

      <CreateDeckDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      <ShareDeckDialog
        deck={shareDeckTarget}
        onClose={() => setShareDeckTarget(null)}
        onUpdate={handleUpdateDeck}
      />
    </div>
  );
}
