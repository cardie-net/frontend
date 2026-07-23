'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Popup } from '@/components/Popup';
import { Button } from '@/components/ui/Button';
import { AlertCircle, LockKeyhole, EyeOff, Globe, Copy, Check } from 'lucide-react';

export interface ShareDeckPopupProps {
  isOpen: boolean;
  onClose: () => void;
  deckId: string | null;
  initialPrivacy?: string;
  initialSlug?: string;
  onSaved?: (updatedDeck: { privacy?: string; slug?: string }) => void;
}

export function ShareDeckPopup({
  isOpen,
  onClose,
  deckId,
  initialPrivacy = 'private',
  initialSlug = '',
  onSaved,
}: ShareDeckPopupProps) {
  const [sharePrivacy, setSharePrivacy] = useState(initialPrivacy);
  const [shareSlug, setShareSlug] = useState(initialSlug);
  const [shareError, setShareError] = useState('');
  const [isUpdatingShare, setIsUpdatingShare] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSharePrivacy(initialPrivacy || 'private');
      setShareSlug(initialSlug || '');
      setShareError('');
      setIsLinkCopied(false);
    }
  }, [isOpen, initialPrivacy, initialSlug]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/decks/${shareSlug || deckId}`);
    setIsLinkCopied(true);
    setTimeout(() => setIsLinkCopied(false), 2000);
  };

  const handleSaveShare = async (e: React.FormEvent) => {
    e.preventDefault();
    setShareError('');

    if (!/^[a-z0-9-]+$/.test(shareSlug)) {
      setShareError('Slug can only contain lowercase letters, numbers, and hyphens.');
      return;
    }

    if (!deckId) return;

    setIsUpdatingShare(true);
    try {
      const res = await apiFetch(`/api/v1/decks/${deckId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          privacy: sharePrivacy,
          slug: shareSlug,
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Failed to update deck');
      }
      const updatedDeck = await res.json();

      if (onSaved) {
        onSaved({ privacy: updatedDeck.privacy, slug: updatedDeck.slug });
      }
      onClose();
    } catch (err) {
      setShareError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsUpdatingShare(false);
    }
  };

  return (
    <Popup isOpen={isOpen} onClose={() => !isUpdatingShare && onClose()} title="Share Settings">
      {shareError && (
        <div className="text-error mb-4 bg-error/10 p-3 rounded-md flex items-start gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>{shareError}</div>
        </div>
      )}

      <form onSubmit={handleSaveShare} className="flex flex-col gap-4">
        <div>
          <div className="flex flex-col sm:flex-row gap-2">
            {[
              { id: 'private', label: 'Private', icon: <LockKeyhole className="w-4 h-4" /> },
              { id: 'unlisted', label: 'Unlisted', icon: <EyeOff className="w-4 h-4" /> },
              { id: 'public', label: 'Public', icon: <Globe className="w-4 h-4" /> },
            ].map((opt) => {
              const isActive = sharePrivacy === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSharePrivacy(opt.id)}
                  disabled={isUpdatingShare}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-md font-bold transition-all text-sm border ${
                    isActive
                      ? 'bg-foreground text-background border-foreground shadow-[2px_2px_0px_var(--color-foreground)] translate-x-[-1px] translate-y-[-1px]'
                      : 'bg-background text-foreground border-border-heavy opacity-70 hover:opacity-100 hover:shadow-[2px_2px_0px_var(--color-border-heavy)] hover:translate-x-[-1px] hover:translate-y-[-1px]'
                  }`}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">URL Slug</label>
          <div className="flex items-center gap-2">
            <input
              className="flex-1 bg-background border border-border-heavy rounded-md px-4 py-2 shadow-[2px_2px_0px_var(--color-border-heavy)] focus:outline-none focus:ring-1 focus:ring-foreground transition-shadow font-mono"
              value={shareSlug}
              onChange={(e) => setShareSlug(e.target.value)}
              required
              maxLength={50}
              disabled={isUpdatingShare}
            />
          </div>
        </div>

        <div className="mt-2">
          <div className="flex sm:gap-2 relative">
            <input
              readOnly
              value={
                typeof window !== 'undefined'
                  ? `${window.location.origin}/decks/${shareSlug || deckId}`
                  : ''
              }
              className="flex-1 bg-background border border-border-heavy rounded-md px-4 py-2 opacity-70 cursor-not-allowed font-mono text-sm pr-10 sm:pr-4"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-foreground hover:bg-foreground/10 rounded-md sm:hidden transition-colors"
              onClick={handleCopyLink}
              title={isLinkCopied ? 'Copied!' : 'Copy Link'}
            >
              {isLinkCopied ? (
                <Check className="w-4 h-4 text-[var(--success)]" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
            <div className="hidden sm:block">
              <Button type="button" variant="secondary" onClick={handleCopyLink}>
                {isLinkCopied ? (
                  <>
                    <Check className="w-4 h-4 text-[var(--success)]" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Copy
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isUpdatingShare}>
            Cancel
          </Button>
          <Button type="submit" disabled={isUpdatingShare}>
            {isUpdatingShare ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </Popup>
  );
}
