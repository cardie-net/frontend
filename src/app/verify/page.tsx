'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setResendSuccess(false);
    setIsResending(true);

    try {
      const response = await apiFetch(`/api/v1/auth/request-verify-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setResendSuccess(true);
        setCooldown(60);
      } else {
        setError('Failed to resend verification email.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!token.trim()) {
      setError('Please enter a verification token.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiFetch(`/api/v1/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        const errData = await response.json().catch(() => ({}));
        if (errData.detail) {
          if (errData.detail === 'VERIFY_USER_BAD_TOKEN') {
            setError('Invalid or expired verification code');
          } else if (errData.detail === 'VERIFY_USER_ALREADY_VERIFIED') {
            setError('Your email is already verified');
          } else {
            setError(typeof errData.detail === 'string' ? errData.detail : 'Verification failed');
          }
        } else {
          setError('Verification failed. Invalid or expired token');
        }
      }
    } catch {
      setError('An error occurred during verification. Please try again');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-foreground text-background border border-border-heavy shadow-[8px_8px_0px_var(--color-border-heavy)] rounded-lg p-6 sm:p-8">
      <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">Verify Email</h1>
      <p className="opacity-80 mb-6 font-medium">Enter your verification token</p>

      {error && (
        <div className="bg-[var(--error)] p-3 rounded-md mb-6 text-sm font-medium text-[var(--error-text)] flex items-start gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}
      {success && (
        <div
          className="bg-[var(--success)] p-3 rounded-md mb-6 text-sm font-medium text-[var(--success-text)] flex items-start gap-2"
          style={{ marginBottom: '1rem', textAlign: 'left' }}
        >
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <div>Email verified successfully! Redirecting to login...</div>
        </div>
      )}
      {resendSuccess && (
        <div
          className="bg-[var(--success)] p-3 rounded-md mb-6 text-sm font-medium text-[var(--success-text)] flex items-start gap-2"
          style={{ marginBottom: '1rem', textAlign: 'left' }}
        >
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <div>Verification email sent successfully. Please check your inbox.</div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-1.5" htmlFor="token">
            Verification Token
          </label>
          <input
            id="token"
            type="text"
            className="w-full bg-background border border-border-heavy rounded-md px-4 py-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-shadow shadow-[2px_2px_0px_var(--color-border-heavy)] font-medium"
            placeholder="Paste your token here"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2.5 bg-primary text-background transition-all rounded-md px-4 py-2.5 text-base font-bold border border-primary-dark shadow-primary hover:-translate-y-px hover:shadow-primary-hover active:translate-y-px active:shadow-none focus:outline-none mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
          disabled={isLoading || success}
        >
          {isLoading ? 'Verifying...' : 'Verify'}
        </button>
      </form>

      <div className="mt-8 pt-4 border-t border-current border-opacity-30">
        <p className="opacity-80 mb-6 font-medium">Didn&apos;t receive the email?</p>
        <div className="mb-4">
          <input
            id="email"
            type="email"
            className="w-full bg-background border border-border-heavy rounded-md px-4 py-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-shadow shadow-[2px_2px_0px_var(--color-border-heavy)] font-medium"
            placeholder="Enter email to resend"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button
          type="button"
          onClick={handleResend}
          className="w-full flex items-center justify-center gap-2.5 bg-background text-foreground transition-all rounded-md px-4 py-2.5 text-base font-bold border border-secondary-dark shadow-secondary hover:-translate-y-px hover:shadow-secondary-hover active:translate-y-px active:shadow-none focus:outline-none mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
          disabled={isResending || cooldown > 0 || success}
        >
          {isResending
            ? 'Sending...'
            : cooldown > 0
              ? `Resend in ${cooldown}s`
              : 'Resend Verification Email'}
        </button>
      </div>

      <p className="mt-4 text-center text-xs sm:text-sm font-medium opacity-80 flex gap-1 sm:gap-2 justify-center">
        <Link href="/login" className="hover:underline font-bold text-background">
          Back to login
        </Link>
      </p>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="flex-1 flex items-center justify-center text-foreground p-4 sm:p-8">
      <Suspense
        fallback={
          <div className="w-full max-w-md bg-foreground text-background border border-border-heavy shadow-[8px_8px_0px_var(--color-border-heavy)] rounded-lg p-6 sm:p-8">
            Loading...
          </div>
        }
      >
        <VerifyContent />
      </Suspense>
    </div>
  );
}
