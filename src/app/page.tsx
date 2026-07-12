'use client';

import { useEffect, useState } from 'react';

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
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/v1/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

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
    <main className="min-h-screen bg-slate-950 text-slate-50 p-8 flex flex-col items-center justify-center font-sans selection:bg-indigo-500/30 relative overflow-hidden">
      {/* Background gradients for premium feel */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse"></div>
      <div
        className="absolute top-0 -right-4 w-72 h-72 bg-fuchsia-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse"
        style={{ animationDelay: '2s' }}
      ></div>
      <div
        className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse"
        style={{ animationDelay: '4s' }}
      ></div>

      <div className="relative z-10 max-w-2xl w-full flex flex-col items-center">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-white/90 to-fuchsia-300 drop-shadow-sm text-center">
          Cardie
        </h1>
        <p className="text-lg text-slate-400 mb-12 text-center max-w-md font-medium">
          Welcome back. Explore your decks and continue learning today.
        </p>

        <div className="w-full bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl transition-all duration-300 hover:shadow-indigo-500/10 hover:border-white/20 group">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">
              Dashboard
            </h2>
            <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 group-hover:scale-110 transition-transform duration-300">
              <svg
                className="w-4 h-4 text-indigo-400"
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
              <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin mb-4"></div>
              <p className="text-slate-400 font-medium animate-pulse">Loading your profile...</p>
            </div>
          ) : user ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                <span className="text-sm font-medium text-slate-400">Email</span>
                <span className="text-sm font-semibold text-slate-200">{user.email}</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                <span className="text-sm font-medium text-slate-400">Account Type</span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {user.is_guest ? 'Guest' : 'Member'}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                <span className="text-sm font-medium text-slate-400">User ID</span>
                <span className="text-xs font-mono text-slate-500 truncate max-w-[200px]">
                  {user.id}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 mb-4 border border-slate-700">
                <svg
                  className="w-8 h-8 text-slate-500"
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
              <p className="text-slate-400 font-medium mb-6">You are not logged in.</p>
              <a
                href="/login"
                className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors focus:ring-4 focus:ring-indigo-500/30 w-full sm:w-auto"
              >
                Sign In
              </a>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
