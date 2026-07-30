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
            <span className="flex items-center text-sm font-medium">{user.email}</span>
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
