'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Globe, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SocialLinks {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
  github?: string;
  website?: string;
}

interface UserProfile {
  id: string;
  email: string;
  is_guest: boolean;
  is_active: boolean;
  display_name: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  social_links?: SocialLinks;
}

interface Deck {
  id: string;
  name: string;
  slug: string;
  description: string;
  properties?: {
    color?: string;
  };
}

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;

  const { user: currentUser } = useAuth();
  
  const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
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

        // Fetch user items (decks)
        const itemsRes = await apiFetch(`/api/v1/users/${profileData.id}/items`);
        if (itemsRes.ok) {
          const itemsData = await itemsRes.json();
          // Filter to only get decks (assuming they have slug)
          const decksOnly = itemsData.filter((item: { slug?: string }) => 'slug' in item);
          setDecks(decksOnly);
        }
      } catch (err) {
        console.error('An unexpected error occurred', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchData();
    }
  }, [username]);

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4 max-w-4xl space-y-8">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
        <Skeleton className="h-[200px] w-full rounded-xl" />
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 mt-20">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
          <h2 className="font-bold text-2xl mb-4">{error || 'Profile not found'}</h2>
          <Link href="/">
            <Button variant="outline">Go back home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser && currentUser.id === profileUser.id;

  const renderSocialIcon = (key: string) => {
    switch (key) {
      case 'website': return <Globe className="w-4 h-4" />;
      default: return <LinkIcon className="w-4 h-4" />;
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <Card className="mb-10 overflow-hidden border-none shadow-md">
        <div className="h-32 bg-muted w-full"></div>
        <CardContent className="pt-0 relative px-6 sm:px-10 pb-10">
          <div className="flex flex-col sm:flex-row gap-6 sm:items-end -mt-16 sm:-mt-12 mb-6">
            <Avatar className="w-32 h-32 border-4 border-background bg-muted">
              {profileUser.avatar_url ? (
                <AvatarImage src={profileUser.avatar_url} alt={profileUser.display_name} />
              ) : (
                <AvatarFallback className="text-4xl">{profileUser.display_name.substring(0, 2).toUpperCase()}</AvatarFallback>
              )}
            </Avatar>
            
            <div className="flex-1 pb-2">
              <h1 className="text-3xl font-bold flex items-center gap-3">
                {profileUser.display_name}
                {profileUser.is_guest && (
                  <Badge variant="secondary">Guest</Badge>
                )}
              </h1>
              <p className="text-muted-foreground font-mono">@{profileUser.username}</p>
            </div>
            
            {isOwnProfile && (
              <div className="pb-2">
                <Link href="/settings">
                  <Button variant="outline">Edit Profile</Button>
                </Link>
              </div>
            )}
          </div>

          {profileUser.bio && (
            <div className="mt-6 text-lg">
              {profileUser.bio}
            </div>
          )}

          {profileUser.social_links && Object.keys(profileUser.social_links).length > 0 && (
            <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t">
              {Object.entries(profileUser.social_links).map(([key, url]) => {
                if (!url) return null;
                return (
                  <a 
                    key={key} 
                    href={url.startsWith('http') ? url : `https://${url}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-full text-sm font-medium transition-colors"
                  >
                    {renderSocialIcon(key)}
                    <span className="capitalize">{key === 'website' ? new URL(url).hostname : key}</span>
                  </a>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-bold">Decks</h2>
          <Badge variant="secondary" className="rounded-full">{decks.length}</Badge>
        </div>

        {decks.length === 0 ? (
          <div className="p-12 border-2 border-dashed rounded-xl text-center text-muted-foreground">
            <p className="font-medium text-lg mb-2">No decks yet</p>
            {isOwnProfile && (
              <Link href="/decks?new=true">
                <Button variant="link">Create your first deck</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {decks.map((deck) => (
              <Link key={deck.id} href={`/${profileUser.username}/${deck.slug}`}>
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer flex flex-col group border-2" style={{ borderTop: deck.properties?.color ? `4px solid var(--color-${deck.properties.color}-500, currentColor)` : undefined }}>
                  <CardHeader>
                    <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
                      {deck.name}
                    </CardTitle>
                    {deck.description && (
                      <CardDescription className="line-clamp-2">
                        {deck.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
