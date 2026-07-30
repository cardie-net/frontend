'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const { user, loading, logout } = useAuth();

  return (
    <nav className="flex items-center justify-between p-4 border-b">
      <Link href="/" className="font-bold text-lg">
        Cardie
      </Link>
      <div className="flex gap-4">
        {!loading && user && !user.is_guest ? (
          <>
            <Link href={`/${user.username}`}>
              <Button variant="ghost" className="font-bold">
                @{user.username || user.display_name || 'Profile'}
              </Button>
            </Link>
            <Link href="/decks">
              <Button variant="ghost">Decks</Button>
            </Link>
            <Link href="/settings">
              <Button variant="ghost">Settings</Button>
            </Link>
            <Button variant="outline" onClick={logout}>
              Log out
            </Button>
          </>
        ) : (
          <>
            <Link href="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign up</Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
