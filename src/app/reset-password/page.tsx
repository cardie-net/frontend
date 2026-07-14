'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSuccess(false);
    setIsLoading(true);

    try {
      const response = await apiFetch(`/api/v1/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        const errData = await response.json().catch(() => ({}));
        if (errData.detail === 'RESET_PASSWORD_BAD_TOKEN') {
          setError('Invalid or expired reset token');
        } else {
          setError(
            typeof errData.detail === 'string'
              ? errData.detail
              : 'Failed to reset password. Invalid or expired token'
          );
        }
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md bg-foreground text-background border border-border-heavy shadow-[8px_8px_0px_var(--color-border-heavy)] rounded-lg p-6 sm:p-8">
        <div style={{ textAlign: 'center' }}>
          <div
            className="bg-[var(--success)] p-3 rounded-md mb-6 text-sm font-medium text-[var(--success-text)] flex items-start gap-2 text-left"
            style={{ marginBottom: '1.5rem' }}
          >
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            <div>Password reset successfully! Redirecting to login...</div>
          </div>
          <Link
            href="/login"
            className="w-full flex items-center justify-center gap-2.5 bg-primary text-background transition-all rounded-md px-4 py-2.5 text-base font-bold border border-primary-dark shadow-primary hover:-translate-y-px hover:shadow-primary-hover active:translate-y-px active:shadow-none focus:outline-none mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            Go to Login now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-foreground text-background border border-border-heavy shadow-[8px_8px_0px_var(--color-border-heavy)] rounded-lg p-6 sm:p-8">
      <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">Set New Password</h1>
      <p className="opacity-80 mb-6 font-medium">Enter your token and new password</p>

      {error && (
        <div className="bg-[var(--error)] p-3 rounded-md mb-6 text-sm font-medium text-[var(--error-text)] flex items-start gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-1.5" htmlFor="token">
            Reset Token
          </label>
          <input
            id="token"
            type="text"
            className="w-full bg-background border border-border-heavy rounded-md px-4 py-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-shadow shadow-[1px_1px_0px_var(--color-border-heavy)] font-medium"
            placeholder="Paste your token here"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-bold mb-1.5" htmlFor="password">
            New Password
          </label>
          <input
            id="password"
            type="password"
            className="w-full bg-background border border-border-heavy rounded-md px-4 py-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-shadow shadow-[1px_1px_0px_var(--color-border-heavy)] font-medium"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-bold mb-1.5" htmlFor="confirmPassword">
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            className="w-full bg-background border border-border-heavy rounded-md px-4 py-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-shadow shadow-[1px_1px_0px_var(--color-border-heavy)] font-medium"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2.5 bg-primary text-background transition-all rounded-md px-4 py-2.5 text-base font-bold border border-primary-dark shadow-primary hover:-translate-y-px hover:shadow-primary-hover active:translate-y-px active:shadow-none focus:outline-none mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex-1 flex items-center justify-center text-foreground p-4 sm:p-8">
      <Suspense
        fallback={
          <div className="w-full max-w-md bg-foreground text-background border border-border-heavy shadow-[8px_8px_0px_var(--color-border-heavy)] rounded-lg p-6 sm:p-8">
            Loading...
          </div>
        }
      >
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
