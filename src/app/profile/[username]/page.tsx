'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Settings, User, AlertCircle } from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface UserProfile {
  id: string;
  email: string;
  is_guest: boolean;
  is_active: boolean;
  display_name: string;
  username: string;
}

interface Deck {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;

  const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch current logged in user
        const meRes = await apiFetch('/api/v1/users/me');
        if (meRes.ok) {
          const meData = await meRes.json();
          setCurrentUser(meData);
        }

        // Fetch profile user
        const profileRes = await apiFetch(`/api/v1/users/profile/${username}`);
        if (!profileRes.ok) {
          if (profileRes.status === 404) {
            setError('User not found');
          } else {
            setError('Failed to load profile');
          }
          setLoading(false);
          return;
        }

        const profileData = await profileRes.json();
        setProfileUser(profileData);
        setEditDisplayName(profileData.display_name);
        setEditUsername(profileData.username);

        // Fetch user items (decks)
        const itemsRes = await apiFetch(`/api/v1/users/${profileData.id}/items`);
        if (itemsRes.ok) {
          const itemsData = await itemsRes.json();
          // Filter to only get decks (assuming folders might not have slug or something, or we just render them all as decks for now)
          // The backend returns Union[FolderRead, DeckRead]
          const decksOnly = itemsData.filter((item: { slug?: string }) => 'slug' in item); // Folders might not have slug? Let's assume all have slug, wait. Actually Folders might be different. Let's assume decks.
          setDecks(decksOnly);
        }
      } catch {
        console.error('An unexpected error occurred');
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username]);

  const isOwnProfile = currentUser && profileUser && currentUser.id === profileUser.id;

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const res = await apiFetch('/api/v1/users/me', {
        method: 'PATCH',
        body: JSON.stringify({
          display_name: editDisplayName,
          username: editUsername,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        let errorMsg = 'Failed to update profile';
        if (data.detail) {
          if (Array.isArray(data.detail)) {
            errorMsg = data.detail.map((err: { msg: string }) => err.msg).join(', ');
          } else if (typeof data.detail === 'string') {
            errorMsg = data.detail;
          } else {
            errorMsg = JSON.stringify(data.detail);
          }
        }
        setSaveError(errorMsg);
        return;
      }

      const updatedUser = await res.json();
      setProfileUser(updatedUser);
      setCurrentUser(updatedUser);
      setIsEditing(false);

      // If username changed, redirect to new username URL
      if (updatedUser.username !== username) {
        window.location.href = `/profile/${updatedUser.username}`;
      }
    } catch {
      setSaveError('An error occurred. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-foreground p-8">
        <p className="font-bold animate-pulse text-lg">Loading profile...</p>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="flex-1 flex items-center justify-center text-foreground p-8">
        <div className="text-center p-8 border-2 border-foreground rounded-xl shadow-[4px_4px_0px_currentColor]">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-error" />
          <p className="font-bold text-xl">{error || 'Profile not found'}</p>
          <Link href="/" className="mt-4 inline-block font-bold underline hover:no-underline">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background text-foreground p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Card */}
        <div className="bg-background border-2 border-foreground rounded-2xl shadow-[4px_4px_0px_currentColor] p-6 sm:p-10 relative">
          {/* Header actions */}
          <div className="absolute top-6 right-6 flex gap-2">
            {isOwnProfile && !isEditing && (
              <Link
                href="/settings"
                aria-label="Settings"
                className="flex items-center justify-center w-[36px] h-[36px] rounded-lg bg-action-btn-bg text-action-btn-text transition-all border border-action-btn-border shadow-[1px_1px_0px_var(--action-btn-border)] hover:-translate-y-px hover:shadow-[2px_2px_0px_var(--action-btn-border)] active:translate-y-px active:shadow-none focus:outline-none"
              >
                <Settings className="w-4 h-4" />
              </Link>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
            {/* PFP */}
            <div className="relative shrink-0">
              <div className="w-32 h-32 rounded-full border-4 border-foreground bg-foreground/5 flex items-center justify-center overflow-hidden">
                <User className="w-16 h-16 opacity-50" />
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left w-full mt-4 sm:mt-8">
              {isEditing ? (
                <div>
                  <input
                    type="text"
                    value={editDisplayName}
                    onChange={(e) => setEditDisplayName(e.target.value)}
                    className="text-4xl font-black mb-1 w-full bg-transparent border-b-2 border-foreground/30 focus:border-foreground focus:outline-none px-0 py-0"
                    placeholder="Display Name"
                  />
                  <div className="flex items-center justify-center sm:justify-start text-lg font-mono opacity-70">
                    <span>@</span>
                    <input
                      type="text"
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      className="bg-transparent border-b-2 border-foreground/30 focus:border-foreground focus:outline-none px-0 py-0 ml-px min-w-[150px] w-auto max-w-full"
                      placeholder="username"
                    />
                  </div>
                  {saveError && (
                    <div className="text-error text-sm font-bold flex items-center justify-center sm:justify-start gap-1 mt-2">
                      <AlertCircle className="w-4 h-4" />
                      {saveError}
                    </div>
                  )}
                  <div className="flex gap-2 mt-4 justify-center sm:justify-start">
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="px-4 py-1.5 bg-foreground text-background font-bold rounded-lg hover:opacity-90 disabled:opacity-50 text-sm"
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditDisplayName(profileUser.display_name);
                        setEditUsername(profileUser.username);
                        setSaveError(null);
                      }}
                      disabled={isSaving}
                      className="px-4 py-1.5 border-2 border-foreground font-bold rounded-lg hover:bg-foreground/10 disabled:opacity-50 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h1 className="text-4xl font-black mb-1">{profileUser.display_name}</h1>
                  <p className="text-lg font-mono opacity-70">@{profileUser.username}</p>
                  {profileUser.is_guest && (
                    <span className="inline-block mt-3 px-2 py-1 text-xs font-bold uppercase tracking-wider border-2 border-foreground rounded">
                      Guest Account
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Decks Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            Decks
            <span className="text-sm px-2 py-0.5 border border-foreground rounded-full opacity-70">
              {decks.length}
            </span>
          </h2>

          {decks.length === 0 ? (
            <div className="p-12 border-2 border-dashed border-foreground/30 rounded-xl text-center">
              <p className="font-bold text-lg mb-2 opacity-70">No decks yet</p>
              {isOwnProfile && (
                <Link
                  href="/decks/new"
                  className="inline-block mt-2 font-bold underline hover:no-underline"
                >
                  Create your first deck
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {decks.map((deck) => (
                <Link key={deck.id} href={`/decks/${deck.id}`}>
                  <div className="group h-full p-6 border-2 border-foreground rounded-xl shadow-[4px_4px_0px_currentColor] hover:-translate-y-1 hover:shadow-[6px_6px_0px_currentColor] transition-all cursor-pointer flex flex-col justify-between bg-background">
                    <div>
                      <h3 className="text-xl font-bold group-hover:underline">{deck.name}</h3>
                      <p className="text-sm opacity-70 mt-2 font-mono">/{deck.slug}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
