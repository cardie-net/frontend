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
        if (errData.detail === 'USER_NOT_EXISTS') {
          setError('No account found with this email address');
        } else {
          setError(
            typeof errData.detail === 'string' ? errData.detail : 'Failed to request password reset'
          );
        }
      }
    } catch {
      setError('An error occurred. Please try again');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center text-foreground p-4 sm:p-8">
      <div className="w-full max-w-md bg-foreground text-background border border-border-heavy shadow-[8px_8px_0px_var(--color-border-heavy)] rounded-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">Reset Password</h1>
        <p className="opacity-80 mb-6 font-medium">Enter your email to receive a reset link</p>

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
              className="w-full flex items-center justify-center gap-2.5 bg-primary text-background transition-all rounded-md px-4 py-2.5 text-base font-bold border border-primary-dark shadow-primary hover:-translate-y-px hover:shadow-primary-hover active:translate-y-px active:shadow-none focus:outline-none mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-bold mb-1.5" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                className="w-full bg-background border border-border-heavy rounded-md px-4 py-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-shadow shadow-[2px_2px_0px_var(--color-border-heavy)] font-medium"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2.5 bg-primary text-background transition-all rounded-md px-4 py-2.5 text-base font-bold border border-primary-dark shadow-primary hover:-translate-y-px hover:shadow-primary-hover active:translate-y-px active:shadow-none focus:outline-none mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        {!success && (
          <p
            className="mt-6 text-center text-xs sm:text-sm font-medium opacity-80 flex gap-1 sm:gap-2 justify-center"
            style={{ marginTop: '1.5rem' }}
          >
            Remember your password?{' '}
            <Link href="/login" className="hover:underline font-bold text-background">
              Log in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
