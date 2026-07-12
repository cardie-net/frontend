'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ThemeToggle } from './ThemeToggle';

export function NavBar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if we have a valid token on load
    const token = localStorage.getItem('jwt_token');
    // In a real app we'd decode the JWT to check expiry or use context,
    // but here we just check if it exists. Guest tokens also exist.
    // We should differentiate between guest and logged-in user.
    // Since guest tokens are automatic, just having a token doesn't mean "logged in".
    // A simple check is to fetch /users/me and see if is_guest is false.
    const checkUser = async () => {
      if (!token) return;
      try {
        const response = await fetch(`/api/v1/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const user = await response.json();
          setIsLoggedIn(!user.is_guest);
        }
      } catch (err) {
        // Ignore
      }
    };
    checkUser();
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      try {
        await fetch(`/api/v1/auth/jwt/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        // Ignore network errors on logout
      }
    }
    localStorage.removeItem('jwt_token');
    setIsLoggedIn(false);
    // Reload the page to reset state and trigger GuestAuth
    window.location.href = '/';
  };

  return (
    <nav className="flex h-[42px] items-center justify-between bg-foreground px-4 text-background">
      <div className="flex items-center gap-4">
        <Link href="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <Link href="/decks" className="hover:text-primary transition-colors">
          Decks
        </Link>
      </div>
      <div className="flex items-center gap-4">
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="rounded bg-red-500 px-3 py-1 text-sm text-white transition-colors hover:bg-red-600"
          >
            Log out
          </button>
        ) : (
          <>
            <Link href="/login" className="text-sm transition-colors hover:text-primary">
              Log in
            </Link>
            <Link href="/signup" className="text-sm transition-colors hover:text-primary">
              Sign up
            </Link>
          </>
        )}
        <ThemeToggle />
      </div>
    </nav>
  );
}
