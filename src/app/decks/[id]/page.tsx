'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { AlertCircle } from 'lucide-react';

interface CardElement {
  type: 'text';
  content: string;
}

interface Card {
  id: string;
  front: CardElement[];
  back: CardElement[];
}

interface Deck {
  id: string;
  name: string;
  slug: string;
}

export default function DeckPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: deckId } = use(params);

  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const fetchDeckAndCards = async () => {
      try {
        const deckRes = await apiFetch(`/api/v1/decks/${deckId}`);
        if (!deckRes.ok) {
          if (deckRes.status === 404) router.push('/decks');
          throw new Error('Failed to fetch deck');
        }
        setDeck(await deckRes.json());

        const cardsRes = await apiFetch(`/api/v1/decks/${deckId}/cards`);
        if (cardsRes.ok) {
          setCards(await cardsRes.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDeckAndCards();
  }, [deckId, router]);

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newFront.trim()) {
      setError('Front of the card is required.');
      return;
    }

    if (!newBack.trim()) {
      setError('Back of the card is required.');
      return;
    }

    setIsAdding(true);
    try {
      const res = await apiFetch(`/api/v1/decks/${deckId}/cards`, {
        method: 'POST',
        body: JSON.stringify({
          front: [{ type: 'text', content: newFront }],
          back: [{ type: 'text', content: newBack }],
          order: cards.length,
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Failed to add card');
      }
      const newCard = await res.json();
      setCards([...cards, newCard]);
      setNewFront('');
      setNewBack('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm('Are you sure you want to delete this card?')) return;
    setIsDeleting(cardId);
    try {
      const res = await apiFetch(`/api/v1/decks/${deckId}/cards/${cardId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete card');
      setCards(cards.filter((c) => c.id !== cardId));
    } catch (err) {
      console.error(err);
      alert('Failed to delete card');
    } finally {
      setIsDeleting(null);
    }
  };

  if (loading)
    return (
      <div className="p-8 text-foreground min-h-[calc(100vh-42px)] flex items-center justify-center">
        Loading deck...
      </div>
    );
  if (!deck)
    return (
      <div className="p-8 text-foreground min-h-[calc(100vh-42px)] flex items-center justify-center">
        Deck not found.
      </div>
    );

  return (
    <div className="min-h-[calc(100vh-42px)] bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/decks"
            className="text-sm font-bold text-foreground/70 hover:text-foreground transition-colors flex items-center gap-2 w-fit"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Decks
          </Link>
        </div>

        <div className="flex justify-between items-baseline mb-8">
          <h1 className="text-4xl font-extrabold">{deck.name}</h1>
          <span className="font-mono text-sm opacity-50">/{deck.slug}</span>
        </div>

        {error && (
          <div className="text-red-500 mb-4 bg-red-100 dark:bg-red-900/30 p-3 rounded-md flex items-start gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        <div className="mb-10 p-6 border border-[#5f4f4e] dark:border-[#d4d4d4] rounded-lg shadow-[4px_4px_0px_#5f4f4e] dark:shadow-[4px_4px_0px_#d4d4d4]">
          <h2 className="text-2xl font-bold mb-4">Add New Card</h2>
          <form onSubmit={handleAddCard} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold mb-2">Front (Question)</label>
                <textarea
                  className="w-full bg-background border border-[#5f4f4e] dark:border-[#d4d4d4] rounded-md px-4 py-3 shadow-[1px_1px_0px_#5f4f4e] dark:shadow-[1px_1px_0px_#d4d4d4] focus:outline-none focus:ring-1 focus:ring-foreground transition-shadow resize-y min-h-[100px]"
                  value={newFront}
                  onChange={(e) => setNewFront(e.target.value)}
                  required
                  placeholder="e.g. What is the capital of France?"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Back (Answer)</label>
                <textarea
                  className="w-full bg-background border border-[#5f4f4e] dark:border-[#d4d4d4] rounded-md px-4 py-3 shadow-[1px_1px_0px_#5f4f4e] dark:shadow-[1px_1px_0px_#d4d4d4] focus:outline-none focus:ring-1 focus:ring-foreground transition-shadow resize-y min-h-[100px]"
                  value={newBack}
                  onChange={(e) => setNewBack(e.target.value)}
                  required
                  placeholder="e.g. Paris"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isAdding}
              className="w-fit bg-[#7e6b69] dark:bg-white text-background px-6 py-2.5 rounded-md font-bold mt-2 hover:-translate-y-px hover:shadow-[2px_2px_0px_#5f4f4e] dark:hover:shadow-[2px_2px_0px_#d4d4d4] border border-[#5f4f4e] dark:border-[#d4d4d4] shadow-[1px_1px_0px_#5f4f4e] dark:shadow-[1px_1px_0px_#d4d4d4] transition-all disabled:opacity-70"
            >
              {isAdding ? 'Adding...' : 'Add Card'}
            </button>
          </form>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Cards ({cards.length})</h2>
        </div>

        <div className="flex flex-col gap-4">
          {cards.map((card, index) => (
            <div
              key={card.id}
              className="p-5 border border-[#5f4f4e] dark:border-[#d4d4d4] rounded-lg shadow-[2px_2px_0px_#5f4f4e] dark:shadow-[2px_2px_0px_#d4d4d4] flex flex-col md:flex-row justify-between items-start gap-6 bg-background"
            >
              <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-foreground/10 hidden md:block -ml-3"></div>
                <div className="pr-0 md:pr-4">
                  <h4 className="text-xs font-bold tracking-wider uppercase mb-3 text-foreground/50 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-foreground/10 flex items-center justify-center text-[10px]">
                      {index + 1}
                    </span>
                    Front
                  </h4>
                  <div className="prose dark:prose-invert max-w-none font-medium whitespace-pre-wrap">
                    {card.front.map((el, i) => (
                      <span key={i}>{el.content}</span>
                    ))}
                  </div>
                </div>
                <div className="pl-0 md:pl-4">
                  <h4 className="text-xs font-bold tracking-wider uppercase mb-3 text-foreground/50">
                    Back
                  </h4>
                  <div className="prose dark:prose-invert max-w-none font-medium whitespace-pre-wrap">
                    {card.back.map((el, i) => (
                      <span key={i}>{el.content}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex md:flex-col gap-2 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t border-dashed border-foreground/20 md:border-t-0">
                <button
                  onClick={() => handleDeleteCard(card.id)}
                  disabled={isDeleting === card.id}
                  className="text-red-500 font-bold text-sm px-3 py-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors w-full md:w-auto text-center"
                >
                  {isDeleting === card.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
          {cards.length === 0 && (
            <div className="p-12 border border-dashed border-foreground/30 rounded-lg text-center text-foreground/70 flex flex-col items-center">
              <svg
                className="w-12 h-12 mb-4 opacity-20"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                ></path>
              </svg>
              <p className="font-medium text-lg">No cards in this deck yet.</p>
              <p className="text-sm mt-1">Add your first card using the form above.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
