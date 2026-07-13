'use client';

import { useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiFetch(`/api/v1/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        const errData = await response.json().catch(() => ({}));
        setError(errData.detail || 'Failed to request password reset.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-42px)] flex items-center justify-center bg-background text-foreground p-8">
      <div className="w-full max-w-md bg-background border border-[#5f4f4e] dark:border-[#d4d4d4] shadow-[4px_4px_0px_#5f4f4e] dark:shadow-[4px_4px_0px_#d4d4d4] rounded-lg p-8">
        <h1 className="text-3xl font-extrabold mb-2 text-foreground">Reset Password</h1>
        <p className="text-foreground/80 mb-6 font-medium">
          Enter your email to receive a reset link
        </p>

        {error && (
          <div className="bg-[var(--error)] p-3 rounded-md mb-6 text-sm font-medium text-[var(--error-text)] flex items-start gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}
        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div
              className="bg-[var(--success)] p-3 rounded-md mb-6 text-sm font-medium text-[var(--success-text)] flex items-start gap-2 text-left"
              style={{ marginBottom: '1.5rem' }}
            >
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <div>Password reset link sent! Please check your email inbox.</div>
            </div>
            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-2.5 bg-[var(--color-primary)] text-[#f7f2e8] transition-all rounded-md px-4 py-2.5 text-base font-bold border border-[#5f4f4e] dark:border-[#d4d4d4] shadow-[1px_1px_0px_#5f4f4e] dark:shadow-[1px_1px_0px_#d4d4d4] hover:-translate-y-px hover:shadow-[2px_2px_0px_#5f4f4e] dark:hover:shadow-[2px_2px_0px_#d4d4d4] active:translate-y-px active:shadow-none focus:outline-none mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
              style={{ display: 'inline-block', textDecoration: 'none' }}
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-bold mb-1.5 text-foreground" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                className="w-full bg-background border border-[#5f4f4e] dark:border-[#d4d4d4] rounded-md px-4 py-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-shadow shadow-[1px_1px_0px_#5f4f4e] dark:shadow-[1px_1px_0px_#d4d4d4] font-medium"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2.5 bg-[var(--color-primary)] text-[#f7f2e8] transition-all rounded-md px-4 py-2.5 text-base font-bold border border-[#5f4f4e] dark:border-[#d4d4d4] shadow-[1px_1px_0px_#5f4f4e] dark:shadow-[1px_1px_0px_#d4d4d4] hover:-translate-y-px hover:shadow-[2px_2px_0px_#5f4f4e] dark:hover:shadow-[2px_2px_0px_#d4d4d4] active:translate-y-px active:shadow-none focus:outline-none mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        {!success && (
          <p
            className="mt-6 text-center text-sm font-medium text-foreground/80 flex gap-2 justify-center"
            style={{ marginTop: '1.5rem' }}
          >
            Remember your password?{' '}
            <Link href="/login" className="text-foreground hover:underline font-bold">
              Log in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
