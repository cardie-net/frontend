'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface User {
  id: string;
}

interface Deck {
  id: string;
  name: string;
  slug: string;
  type: 'deck';
}

export default function DecksPage() {
  const [user, setUser] = useState<User | null>(null);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckSlug, setNewDeckSlug] = useState('');
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndDecks = async () => {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const userRes = await fetch(`/api/v1/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!userRes.ok) throw new Error('Failed to fetch user');
        const userData = await userRes.json();
        setUser(userData);

        const itemsRes = await fetch(`/api/v1/users/${userData.id}/items`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!itemsRes.ok) throw new Error('Failed to fetch items');
        const itemsData = await itemsRes.json();

        setDecks(itemsData.filter((item: any) => item.type === 'deck'));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndDecks();
  }, []);

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('jwt_token');
    try {
      const res = await fetch(`/api/v1/decks/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newDeckName,
          slug: newDeckSlug,
          privacy: 'private',
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Failed to create deck');
      }
      const newDeck = await res.json();
      setDecks([...decks, newDeck]);
      setNewDeckName('');
      setNewDeckSlug('');
      setError('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteDeck = async (e: React.MouseEvent, deckId: string) => {
    e.preventDefault(); // Prevent navigating to the deck
    if (!confirm('Are you sure you want to delete this deck? All cards will be lost.')) return;

    setIsDeleting(deckId);
    const token = localStorage.getItem('jwt_token');
    try {
      const res = await fetch(`/api/v1/decks/${deckId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete deck');
      setDecks(decks.filter((d) => d.id !== deckId));
    } catch (err) {
      console.error(err);
      alert('Failed to delete deck');
    } finally {
      setIsDeleting(null);
    }
  };

  if (loading)
    return (
      <div className="p-8 text-foreground min-h-[calc(100vh-42px)] flex items-center justify-center">
        Loading...
      </div>
    );
  if (!user)
    return (
      <div className="p-8 text-foreground min-h-[calc(100vh-42px)] flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4">Please log in to view decks.</p>
          <Link
            href="/login"
            className="bg-[#7e6b69] dark:bg-white text-background px-4 py-2 rounded-md font-bold"
          >
            Log In
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-[calc(100vh-42px)] bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold">My Decks</h1>
          <Link
            href="/decks/new"
            className="bg-[#7e6b69] dark:bg-white text-background px-4 py-2.5 rounded-md font-bold hover:-translate-y-px hover:shadow-[2px_2px_0px_#5f4f4e] dark:hover:shadow-[2px_2px_0px_#d4d4d4] border border-[#5f4f4e] dark:border-[#d4d4d4] shadow-[1px_1px_0px_#5f4f4e] dark:shadow-[1px_1px_0px_#d4d4d4] transition-all"
          >
            + New Deck
          </Link>
        </div>

        {error && (
          <div className="text-red-500 mb-4 bg-red-100 dark:bg-red-900/30 p-3 rounded-md">
            {error}
          </div>
        )}

        <h2 className="text-2xl font-bold mb-4">Your Decks ({decks.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map((deck) => (
            <Link key={deck.id} href={`/decks/${deck.id}`}>
              <div className="group h-full p-6 border border-[#5f4f4e] dark:border-[#d4d4d4] rounded-lg shadow-[4px_4px_0px_#5f4f4e] dark:shadow-[4px_4px_0px_#d4d4d4] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#5f4f4e] dark:hover:shadow-[6px_6px_0px_#d4d4d4] transition-all cursor-pointer flex flex-col justify-between bg-background">
                <div>
                  <h3 className="text-xl font-bold group-hover:underline">{deck.name}</h3>
                  <p className="text-sm opacity-70 mt-2 font-mono">/{deck.slug}</p>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={(e) => handleDeleteDeck(e, deck.id)}
                    disabled={isDeleting === deck.id}
                    className="text-red-500 font-bold text-sm px-2 py-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  >
                    {isDeleting === deck.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </Link>
          ))}
          {decks.length === 0 && (
            <div className="col-span-full p-12 border border-dashed border-foreground/30 rounded-lg text-center text-foreground/70 flex flex-col items-center">
              <p className="font-medium text-lg mb-2">No decks found.</p>
              <p className="text-sm">Create your first deck to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
