'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { AlertCircle } from 'lucide-react';

export default function NewDeckPage() {
  const router = useRouter();
  const [newDeckName, setNewDeckName] = useState('');
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newDeckName.trim()) {
      setError('Deck name is required.');
      return;
    }

    if (newDeckName.length > 80) {
      setError('Deck name must be at most 80 characters.');
      return;
    }

    setIsCreating(true);

    try {
      const res = await apiFetch(`/api/v1/decks`, {
        method: 'POST',
        body: JSON.stringify({
          name: newDeckName,
          privacy: 'private',
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Failed to create deck');
      }
      const newDeck = await res.json();
      router.push(`/decks/${newDeck.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsCreating(false);
    }
  };

  return (
    <div className="flex-1 text-foreground p-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-background border border-border-heavy shadow-[4px_4px_0px_var(--color-border-heavy)] rounded-lg p-8">
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

        <h1 className="text-3xl font-extrabold mb-6">Create New Deck</h1>

        {error && (
          <div className="text-error mb-6 bg-error/10 p-3 rounded-md flex items-start gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleCreateDeck} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold mb-2">Deck Name</label>
            <input
              className="w-full bg-background border border-border-heavy rounded-md px-4 py-2 shadow-[1px_1px_0px_var(--color-border-heavy)] focus:outline-none focus:ring-1 focus:ring-foreground transition-shadow"
              value={newDeckName}
              onChange={(e) => setNewDeckName(e.target.value)}
              required
              maxLength={80}
              placeholder="e.g. Spanish Vocabulary"
            />
          </div>

          <button
            type="submit"
            disabled={isCreating}
            className="w-full bg-action-btn-bg text-background px-4 py-3 rounded-md font-bold mt-4 hover:-translate-y-px hover:shadow-action-hover border border-action-btn-border shadow-action transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isCreating ? 'Creating...' : 'Create Deck'}
          </button>
        </form>
      </div>
    </div>
  );
}
