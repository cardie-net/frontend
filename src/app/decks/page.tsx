'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import { Popup } from '@/components/Popup';
import { AlertCircle, Plus, Pencil, Trash2, MoreVertical, FolderOpen, Share2 } from 'lucide-react';
import { DECK_COLORS, getDeckStyle } from '@/lib/colors';

interface Deck {
  id: string;
  name: string;
  slug: string;
  type: 'deck';
  properties?: {
    color?: string;
  };
}

export default function DecksPage() {
  return (
    <Suspense fallback={<Spinner className="flex-1" />}>
      <DecksPageContent />
    </Suspense>
  );
}

function DecksPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [decksLoading, setDecksLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.deck-dropdown-container')) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // New Deck State
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckColor, setNewDeckColor] = useState('default');
  const [createError, setCreateError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setIsPopupOpen(true);
      router.replace('/decks', { scroll: false });
    }
  }, [searchParams, router]);

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
      setActiveDropdown(null);
    }
  };

  const handleShareDeck = async (e: React.MouseEvent, deckId: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/decks/${deckId}`);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy link', err);
      alert('Failed to copy link to clipboard');
    }
    setActiveDropdown(null);
  };

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');

    if (!newDeckName.trim()) {
      setCreateError('Deck name is required.');
      return;
    }

    if (newDeckName.length > 80) {
      setCreateError('Deck name must be at most 80 characters.');
      return;
    }

    setIsCreating(true);

    try {
      const res = await apiFetch(`/api/v1/decks`, {
        method: 'POST',
        body: JSON.stringify({
          name: newDeckName,
          privacy: 'private',
          properties: { color: newDeckColor === 'default' ? null : newDeckColor },
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Failed to create deck');
      }
      const newDeck = await res.json();

      setIsPopupOpen(false);
      setNewDeckName('');
      setNewDeckColor('default');
      setIsCreating(false);
      router.push(`/decks/${newDeck.id}`);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'An error occurred');
      setIsCreating(false);
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
    <div className="flex-1 text-foreground p-8">
      {/* Blur Overlay */}
      <div
        className={`fixed inset-0 bg-foreground/50 backdrop-blur-sm z-40 sm:hidden transition-all duration-200 ${
          activeDropdown ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        aria-hidden="true"
      />

      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            Decks
            <span className="text-sm px-2 py-0.5 border border-foreground rounded-full opacity-70">
              {decks.length}
            </span>
          </h2>
          <Button onClick={() => setIsPopupOpen(true)}>
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">New Deck</span>
          </Button>
        </div>

        {error && <Alert className="mb-4">{error}</Alert>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {decks.map((deck) => (
            <Link
              key={deck.id}
              href={`/decks/${deck.id}`}
              className={`group block h-full ${activeDropdown === deck.id ? 'relative z-50' : 'relative z-0'}`}
            >
              <Card
                hoverable
                className="h-full flex items-center justify-between !p-4"
                style={getDeckStyle(deck.properties?.color)}
              >
                <div className="min-w-0 pr-2">
                  <h3 className="text-lg font-bold group-hover:underline truncate">{deck.name}</h3>
                  <p className="text-sm opacity-70 mt-1 font-mono truncate">/{deck.slug}</p>
                </div>
                <div className="relative shrink-0 deck-dropdown-container">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActiveDropdown(activeDropdown === deck.id ? null : deck.id);
                    }}
                    className="p-2 rounded-full hover:bg-background/20 transition-colors focus:outline-none"
                    title="Deck Options"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  <div
                    className={`absolute right-0 top-full mt-2 w-40 bg-background text-foreground rounded-lg border-2 border-foreground shadow-[4px_4px_0px_currentColor] p-1 z-50 flex flex-col gap-1 transition-all duration-200 ease-out origin-top-right ${
                      activeDropdown === deck.id
                        ? 'opacity-100 scale-100 visible'
                        : 'opacity-0 scale-95 invisible'
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <button
                      className="w-full text-left px-3 py-2 text-sm font-bold hover:bg-foreground/10 rounded-md transition-colors flex items-center gap-2"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setActiveDropdown(null);
                        router.push(`/decks/${deck.id}`);
                      }}
                    >
                      <FolderOpen className="w-4 h-4" /> Open
                    </button>
                    <button
                      className="w-full text-left px-3 py-2 text-sm font-bold hover:bg-foreground/10 rounded-md transition-colors flex items-center gap-2"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setActiveDropdown(null);
                        router.push(`/decks/${deck.id}/edit`);
                      }}
                    >
                      <Pencil className="w-4 h-4" /> Edit
                    </button>
                    <button
                      className="w-full text-left px-3 py-2 text-sm font-bold hover:bg-foreground/10 rounded-md transition-colors flex items-center gap-2"
                      onClick={(e) => handleShareDeck(e, deck.id)}
                    >
                      <Share2 className="w-4 h-4" /> Share
                    </button>
                    <button
                      disabled={isDeleting === deck.id}
                      className="w-full text-left px-3 py-2 text-sm font-bold text-error hover:bg-error/10 rounded-md transition-colors disabled:opacity-50 flex items-center gap-2"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeleteDeck(e, deck.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
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

      <Popup
        isOpen={isPopupOpen}
        onClose={() => !isCreating && setIsPopupOpen(false)}
        title="Create New Deck"
      >
        {createError && (
          <div className="text-error mb-4 bg-error/10 p-3 rounded-md flex items-start gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>{createError}</div>
          </div>
        )}

        <form onSubmit={handleCreateDeck} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold mb-2">Deck Name</label>
            <input
              className="w-full bg-background border border-border-heavy rounded-md px-4 py-2 shadow-[2px_2px_0px_var(--color-border-heavy)] focus:outline-none focus:ring-1 focus:ring-foreground transition-shadow"
              value={newDeckName}
              onChange={(e) => setNewDeckName(e.target.value)}
              required
              maxLength={80}
              placeholder="e.g. Spanish Vocabulary"
              disabled={isCreating}
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Deck Color</label>
            <div className="flex flex-wrap gap-2">
              {DECK_COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setNewDeckColor(c.id)}
                  className={`w-8 h-8 rounded-full border-2 ${newDeckColor === c.id ? 'border-foreground shadow-[2px_2px_0px_var(--color-border-heavy)] scale-110' : 'border-transparent shadow-sm'} transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background`}
                  style={getDeckStyle(c.id)}
                  title={c.label}
                  aria-label={`Select ${c.label} color`}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsPopupOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Deck'}
            </Button>
          </div>
        </form>
      </Popup>
    </div>
  );
}
