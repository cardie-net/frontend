'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';

interface Deck {
  id: string;
  name: string;
  slug: string;
  type: 'deck';
}

export default function DecksPage() {
  const { user, loading: authLoading } = useAuth();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [decksLoading, setDecksLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDecksLoading(false);
      return;
    }

    const fetchDecks = async () => {
      try {
        const itemsRes = await apiFetch(`/api/v1/users/${user.id}/items`);
        if (!itemsRes.ok) throw new Error('Failed to fetch items');
        const itemsData = await itemsRes.json();
        setDecks(itemsData.filter((item: { type: string }) => item.type === 'deck'));
      } catch (err) {
        console.error(err);
      } finally {
        setDecksLoading(false);
      }
    };
    fetchDecks();
  }, [user, authLoading]);

  const handleDeleteDeck = async (e: React.MouseEvent, deckId: string) => {
    e.preventDefault(); // Prevent navigating to the deck
    if (!confirm('Are you sure you want to delete this deck? All cards will be lost.')) return;

    setIsDeleting(deckId);
    try {
      const res = await apiFetch(`/api/v1/decks/${deckId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete deck');
      setDecks(decks.filter((d) => d.id !== deckId));
    } catch {
      setError('Failed to delete deck');
    } finally {
      setIsDeleting(null);
    }
  };

  if (authLoading || decksLoading) return <Spinner className="flex-1" />;

  if (!user)
    return (
      <div className="p-8 text-foreground flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4">Please log in to view decks.</p>
          <Button href="/login">Log In</Button>
        </div>
      </div>
    );

  return (
    <div className="flex-1 bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold">My Decks</h1>
          <Button href="/decks/new">+ New Deck</Button>
        </div>

        {error && <Alert className="mb-4">{error}</Alert>}

        <h2 className="text-2xl font-bold mb-4">Your Decks ({decks.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map((deck) => (
            <Link key={deck.id} href={`/decks/${deck.id}`}>
              <Card hoverable className="h-full flex flex-col justify-between p-6">
                <div>
                  <h3 className="text-xl font-bold group-hover:underline">{deck.name}</h3>
                  <p className="text-sm opacity-70 mt-2 font-mono">/{deck.slug}</p>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={(e) => handleDeleteDeck(e, deck.id)}
                    disabled={isDeleting === deck.id}
                    className="text-error font-bold text-sm px-2 py-1 rounded hover:bg-error/10 transition-colors disabled:opacity-50"
                  >
                    {isDeleting === deck.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </Card>
            </Link>
          ))}
          {decks.length === 0 && (
            <div className="col-span-full p-12 border border-dashed border-border-heavy rounded-lg text-center text-foreground/70 flex flex-col items-center">
              <p className="font-medium text-lg mb-2">No decks found.</p>
              <p className="text-sm">Create your first deck to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
