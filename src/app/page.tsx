'use client';

import { useAuth } from '@/lib/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <main className="flex-1 bg-background text-foreground p-8 flex flex-col items-center justify-center font-sans">
      <div className="max-w-2xl w-full flex flex-col items-center">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4 text-foreground text-center">
          Cardie
        </h1>
        <p className="text-lg text-foreground/80 mb-12 text-center max-w-md font-medium">
          Welcome back. Explore your decks and continue learning today.
        </p>

        <Card className="w-full">
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
            <Spinner />
          ) : user ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-md bg-background border border-border-heavy shadow-[1px_1px_0px_var(--color-border-heavy)]">
                <span className="text-sm font-bold text-foreground">Email</span>
                <span className="text-sm font-medium text-foreground/80">{user.email}</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-md bg-background border border-border-heavy shadow-[1px_1px_0px_var(--color-border-heavy)]">
                <span className="text-sm font-bold text-foreground">Account Type</span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-action-btn-bg text-action-btn-text border border-border-heavy shadow-[1px_1px_0px_var(--color-border-heavy)]">
                  {user.is_guest ? 'Guest' : 'Member'}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-md bg-background border border-border-heavy shadow-[1px_1px_0px_var(--color-border-heavy)]">
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
              <Button href="/login" className="w-full sm:w-auto">
                Sign In
              </Button>
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
