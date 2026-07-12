'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { NavbarButton } from './NavbarButton';
import { Home, Layers, LogIn, UserPlus, LogOut } from 'lucide-react';

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
    <nav className="flex h-[42px] relative items-center justify-between bg-foreground px-3 text-background">
      <div className="flex items-center gap-3">
        <NavbarButton href="/" icon={Home}>
          Home
        </NavbarButton>
        <NavbarButton href="/decks" icon={Layers}>
          Decks
        </NavbarButton>
      </div>

      <Link
        href="/"
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-auto"
      >
        <img
          src="/logo.svg"
          alt="Cardie.net Logo"
          className="h-[24px] dark:invert transition-all"
        />
      </Link>

      <div className="flex items-center gap-3 z-10">
        {isLoggedIn ? (
          <NavbarButton onClick={handleLogout} icon={LogOut}>
            Log out
          </NavbarButton>
        ) : (
          <>
            <NavbarButton href="/login" icon={LogIn}>
              Log in
            </NavbarButton>
            <NavbarButton href="/signup" icon={UserPlus}>
              Sign up
            </NavbarButton>
          </>
        )}
        <ThemeToggle />
      </div>
    </nav>
  );
}
