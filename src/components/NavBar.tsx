'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/lib/config';

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
        const response = await fetch(`${API_BASE_URL}/users/me`, {
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
        await fetch(`${API_BASE_URL}/auth/jwt/logout`, {
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
    <nav
      style={{
        padding: '1rem',
        borderBottom: '1px solid #ccc',
        display: 'flex',
        gap: '1rem',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link href="/">Home</Link>
        <Link href="/decks">Decks</Link>
      </div>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1rem',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Log out
          </button>
        ) : (
          <>
            <Link href="/login">Log in</Link>
            <Link href="/signup">Sign up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
