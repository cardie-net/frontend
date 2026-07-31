'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LockKeyhole, EyeOff, Globe, Copy, Check } from 'lucide-react';
import { Deck } from '@/types';
import { useAuth } from '@/lib/AuthContext';

interface ShareDeckDialogProps {
  deck: Deck | null;
  onClose: () => void;
  onUpdate: (updatedDeck: Deck) => void;
}

export function ShareDeckDialog({ deck, onClose, onUpdate }: ShareDeckDialogProps) {
  const { user } = useAuth();
  
  const [sharePrivacy, setSharePrivacy] = useState('private');
  const [shareSlug, setShareSlug] = useState('');
  const [shareError, setShareError] = useState('');
  const [isUpdatingShare, setIsUpdatingShare] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  useEffect(() => {
    if (deck) {
      setSharePrivacy(deck.privacy || 'private');
      setShareSlug(deck.slug || '');
      setShareError('');
      setIsLinkCopied(false);
    }
  }, [deck]);

  const handleSaveShare = async (e: React.FormEvent) => {
    e.preventDefault();
    setShareError('');

    if (!/^[a-z0-9-]+$/.test(shareSlug)) {
      setShareError('Slug can only contain lowercase letters, numbers, and hyphens.');
      return;
    }

    if (!deck) return;

    setIsUpdatingShare(true);
    try {
      const res = await apiFetch(`/api/v1/decks/${deck.id}`, {
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
      
      onUpdate(updatedDeck);
      onClose();
    } catch (err) {
      setShareError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsUpdatingShare(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/${user?.username}/${shareSlug || deck?.id}`);
    setIsLinkCopied(true);
    setTimeout(() => setIsLinkCopied(false), 2000);
  };

  return (
    <Dialog open={!!deck} onOpenChange={(open) => !isUpdatingShare && !open && onClose()}>
      <DialogContent>
        <form onSubmit={handleSaveShare}>
          <DialogHeader>
            <DialogTitle>Share Settings</DialogTitle>
            <DialogDescription>
              Update the privacy and URL slug for your deck.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {shareError && <Alert variant="destructive">{shareError}</Alert>}
            
            <div className="grid gap-2">
              <Label>Privacy</Label>
              <div className="flex gap-2">
                {[
                  { id: 'private', label: 'Private', icon: <LockKeyhole className="w-4 h-4" /> },
                  { id: 'unlisted', label: 'Unlisted', icon: <EyeOff className="w-4 h-4" /> },
                  { id: 'public', label: 'Public', icon: <Globe className="w-4 h-4" /> },
                ].map((opt) => (
                  <Button
                    key={opt.id}
                    type="button"
                    variant={sharePrivacy === opt.id ? 'default' : 'outline'}
                    onClick={() => setSharePrivacy(opt.id)}
                    disabled={isUpdatingShare}
                    className="flex-1"
                  >
                    {opt.icon}
                    <span className="ml-2">{opt.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label>URL Slug</Label>
              <Input
                value={shareSlug}
                onChange={(e) => setShareSlug(e.target.value)}
                maxLength={50}
                disabled={isUpdatingShare}
                required
                className="font-mono"
              />
            </div>

            <div className="grid gap-2">
              <Label>Share Link</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={typeof window !== 'undefined' ? `${window.location.origin}/${user?.username}/${shareSlug || deck?.id}` : ''}
                  className="font-mono text-xs opacity-70"
                />
                <Button type="button" variant="secondary" onClick={handleCopyLink}>
                  {isLinkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isUpdatingShare}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdatingShare}>
              {isUpdatingShare ? 'Saving...' : 'Save Settings'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
