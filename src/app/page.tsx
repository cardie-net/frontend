'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

interface User {
  id: string;
  email: string;
  is_guest: boolean;
  is_active: boolean;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await apiFetch(`/api/v1/users/me`);

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <main className="flex-1 bg-background text-foreground p-8 flex flex-col items-center justify-center font-sans">
      <div className="max-w-2xl w-full flex flex-col items-center">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4 text-foreground text-center">
          Cardie
        </h1>
        <p className="text-lg text-foreground/80 mb-12 text-center max-w-md font-medium">
          Welcome back. Explore your decks and continue learning today.
        </p>

        <div className="w-full bg-background border border-[#5f4f4e] dark:border-[#d4d4d4] shadow-[4px_4px_0px_#5f4f4e] dark:shadow-[4px_4px_0px_#d4d4d4] rounded-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
            <div className="h-8 w-8 rounded-full border border-foreground/30 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-foreground/70"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                ></path>
              </svg>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin mb-4"></div>
              <p className="text-foreground/80 font-medium animate-pulse">
                Loading your profile...
              </p>
            </div>
          ) : user ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-md bg-background border border-[#5f4f4e] dark:border-[#d4d4d4] shadow-[1px_1px_0px_#5f4f4e] dark:shadow-[1px_1px_0px_#d4d4d4]">
                <span className="text-sm font-bold text-foreground">Email</span>
                <span className="text-sm font-medium text-foreground/80">{user.email}</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-md bg-background border border-[#5f4f4e] dark:border-[#d4d4d4] shadow-[1px_1px_0px_#5f4f4e] dark:shadow-[1px_1px_0px_#d4d4d4]">
                <span className="text-sm font-bold text-foreground">Account Type</span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-[#7e6b69] dark:bg-white text-background border border-[#5f4f4e] dark:border-[#d4d4d4] shadow-[1px_1px_0px_#5f4f4e] dark:shadow-[1px_1px_0px_#d4d4d4]">
                  {user.is_guest ? 'Guest' : 'Member'}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-md bg-background border border-[#5f4f4e] dark:border-[#d4d4d4] shadow-[1px_1px_0px_#5f4f4e] dark:shadow-[1px_1px_0px_#d4d4d4]">
                <span className="text-sm font-bold text-foreground">User ID</span>
                <span className="text-xs font-mono text-foreground/70 truncate max-w-[200px]">
                  {user.id}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-foreground/30 mb-4">
                <svg
                  className="w-8 h-8 text-foreground/60"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  ></path>
                </svg>
              </div>
              <p className="text-foreground/80 font-medium mb-6">You are not logged in.</p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2.5 bg-[#7e6b69] dark:bg-white text-background transition-all rounded-md px-6 py-2.5 text-sm font-bold border border-[#5f4f4e] dark:border-[#d4d4d4] shadow-[1px_1px_0px_#5f4f4e] dark:shadow-[1px_1px_0px_#d4d4d4] hover:-translate-y-px hover:shadow-[2px_2px_0px_#5f4f4e] dark:hover:shadow-[2px_2px_0px_#d4d4d4] active:translate-y-px active:shadow-none focus:outline-none w-full sm:w-auto"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
