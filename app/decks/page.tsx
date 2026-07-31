'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Plus } from 'lucide-react';
import { Deck } from '@/types';
import { CreateDeckDialog } from '@/components/decks/CreateDeckDialog';
import { ShareDeckDialog } from '@/components/decks/ShareDeckDialog';
import { DeckCard } from '@/components/decks/DeckCard';

export default function DecksPage() {
  const { user, loading: authLoading } = useAuth();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [decksLoading, setDecksLoading] = useState(true);
  const [error, setError] = useState('');

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [shareDeckTarget, setShareDeckTarget] = useState<Deck | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.is_guest) {
      setDecksLoading(false);
      return;
    }

    const fetchDecks = async () => {
      try {
        const res = await apiFetch(`/api/v1/users/${user.id}/items`);
        if (!res.ok) throw new Error('Failed to fetch items');
        const data = await res.json();
        setDecks(data.filter((item: { type: string }) => item.type === 'deck'));
      } catch (err) {
        console.error(err);
        setError('Failed to load decks');
      } finally {
        setDecksLoading(false);
      }
    };
    fetchDecks();
  }, [user, authLoading]);

  const handleDeleteDeck = async (deckId: string) => {
    if (!confirm('Are you sure you want to delete this deck? All cards will be lost.')) return;
    try {
      const res = await apiFetch(`/api/v1/decks/${deckId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete deck');
      setDecks(decks.filter((d) => d.id !== deckId));
    } catch {
      setError('Failed to delete deck');
    }
  };

  const handleUpdateDeck = (updatedDeck: Deck) => {
    setDecks(decks.map((d) => (d.id === updatedDeck.id ? updatedDeck : d)));
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

      {error && <Alert variant="destructive" className="mb-6">{error}</Alert>}

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
