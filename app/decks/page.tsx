'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { cn, getDeckColorClass } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardAction } from '@/components/ui/card';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Trash2, Pencil, BookOpen, Plus, MoreVertical, Share2, LockKeyhole, EyeOff, Globe, Copy, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Deck {
  id: string;
  name: string;
  slug: string;
  type: 'deck';
  privacy?: 'public' | 'unlisted' | 'private' | string;
  properties?: {
    color?: string;
  };
}

const DECK_COLORS = [
  { id: 'default', label: 'Default (Theme)' },
  { id: 'red', label: 'Red' },
  { id: 'orange', label: 'Orange' },
  { id: 'amber', label: 'Amber' },
  { id: 'green', label: 'Green' },
  { id: 'emerald', label: 'Emerald' },
  { id: 'teal', label: 'Teal' },
  { id: 'cyan', label: 'Cyan' },
  { id: 'blue', label: 'Blue' },
  { id: 'indigo', label: 'Indigo' },
  { id: 'violet', label: 'Violet' },
  { id: 'purple', label: 'Purple' },
  { id: 'fuchsia', label: 'Fuchsia' },
  { id: 'pink', label: 'Pink' },
  { id: 'rose', label: 'Rose' },
];

export default function DecksPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [decksLoading, setDecksLoading] = useState(true);
  const [error, setError] = useState('');

  // New deck state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckColor, setNewDeckColor] = useState('default');
  const [createError, setCreateError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Share state
  const [shareDeckTarget, setShareDeckTarget] = useState<Deck | null>(null);
  const [sharePrivacy, setSharePrivacy] = useState('private');
  const [shareSlug, setShareSlug] = useState('');
  const [shareError, setShareError] = useState('');
  const [isUpdatingShare, setIsUpdatingShare] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  useEffect(() => {
    if (shareDeckTarget) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSharePrivacy(shareDeckTarget.privacy || 'private');
      setShareSlug(shareDeckTarget.slug || '');
      setShareError('');
      setIsLinkCopied(false);
    }
  }, [shareDeckTarget]);

  const handleSaveShare = async (e: React.FormEvent) => {
    e.preventDefault();
    setShareError('');

    if (!/^[a-z0-9-]+$/.test(shareSlug)) {
      setShareError('Slug can only contain lowercase letters, numbers, and hyphens.');
      return;
    }

    if (!shareDeckTarget) return;

    setIsUpdatingShare(true);
    try {
      const res = await apiFetch(`/api/v1/decks/${shareDeckTarget.id}`, {
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
      
      setDecks(decks.map((d) => (d.id === shareDeckTarget.id ? { ...d, privacy: updatedDeck.privacy, slug: updatedDeck.slug } : d)));
      setShareDeckTarget(null);
    } catch (err) {
      setShareError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsUpdatingShare(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/${user?.username}/${shareSlug || shareDeckTarget?.id}`);
    setIsLinkCopied(true);
    setTimeout(() => setIsLinkCopied(false), 2000);
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    if (!newDeckName.trim()) {
      setCreateError('Deck name is required.');
      return;
    }

    setIsCreating(true);
    try {
      const res = await apiFetch('/api/v1/decks', {
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

      setIsDialogOpen(false);
      setNewDeckName('');
      setNewDeckColor('default');
      router.push(`/${user?.username}/${newDeck.slug}`);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsCreating(false);
    }
  };

  if (authLoading || decksLoading) {
    return <div className="p-8">Loading decks...</div>;
  }

  if (!user) {
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
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="mr-2 w-4 h-4" /> New Deck
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreateDeck}>
              <DialogHeader>
                <DialogTitle>Create New Deck</DialogTitle>
                <DialogDescription>
                  Enter a name and choose a color for your new deck.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {createError && <Alert variant="destructive">{createError}</Alert>}
                <div className="grid gap-2">
                  <Label htmlFor="name">Deck Name</Label>
                  <Input
                    id="name"
                    value={newDeckName}
                    onChange={(e) => setNewDeckName(e.target.value)}
                    placeholder="e.g. Spanish Vocabulary"
                    maxLength={80}
                    disabled={isCreating}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Color</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newDeckColor}
                    onChange={(e) => setNewDeckColor(e.target.value)}
                    disabled={isCreating}
                  >
                    {DECK_COLORS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isCreating}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && <Alert variant="destructive" className="mb-6">{error}</Alert>}

      {decks.length === 0 ? (
        <div className="text-center p-12 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground mb-4">You don&apos;t have any decks yet.</p>
          <Button onClick={() => setIsDialogOpen(true)} variant="outline">
            Create your first deck
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map((deck) => (
            <Card key={deck.id} className={cn("flex flex-col relative", getDeckColorClass(deck.properties?.color))}>
              <CardHeader>
                <CardTitle className="pr-8">{deck.name}</CardTitle>
                <CardAction>
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="-mr-2 h-8 w-8" />}>
                      <MoreVertical className="w-4 h-4" />
                      <span className="sr-only">Open menu</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setShareDeckTarget(deck)}>
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteDeck(deck.id)} className="text-destructive focus:text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardAction>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground capitalize">{deck.privacy} Deck</p>
              </CardContent>
              <CardFooter className="flex gap-2 pt-4">
                <Link href={`/${user?.username}/${deck.slug}`} className="flex-1">
                  <Button className="w-full" variant="default">
                    <BookOpen className="w-4 h-4 mr-2" /> Learn
                  </Button>
                </Link>
                <Link href={`/${user?.username}/${deck.slug}?edit=true`} className="flex-1">
                  <Button className="w-full" variant="outline">
                    <Pencil className="w-4 h-4 mr-2" /> Edit
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!shareDeckTarget} onOpenChange={(open) => !isUpdatingShare && !open && setShareDeckTarget(null)}>
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
                    value={typeof window !== 'undefined' ? `${window.location.origin}/${user?.username}/${shareSlug || shareDeckTarget?.id}` : ''}
                    className="font-mono text-xs opacity-70"
                  />
                  <Button type="button" variant="secondary" onClick={handleCopyLink}>
                    {isLinkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShareDeckTarget(null)} disabled={isUpdatingShare}>
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdatingShare}>
                {isUpdatingShare ? 'Saving...' : 'Save Settings'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
