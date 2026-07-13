'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

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
    if (!email) {
      setError('Please enter your email below to resend the verification code.');
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
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
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
          setError(typeof errData.detail === 'string' ? errData.detail : 'Verification failed.');
        } else {
          setError('Verification failed. Invalid or expired token.');
        }
      }
    } catch (err) {
      setError('An error occurred during verification. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-background border border-[#5f4f4e] dark:border-[#d4d4d4] shadow-[4px_4px_0px_#5f4f4e] dark:shadow-[4px_4px_0px_#d4d4d4] rounded-lg p-8">
      <h1 className="text-3xl font-extrabold mb-2 text-foreground">Verify Email</h1>
      <p className="text-foreground/80 mb-6 font-medium">Enter your verification token</p>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-md mb-6 text-sm font-medium border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}
      {success && (
        <div
          className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-3 rounded-md mb-6 text-sm font-medium border border-green-200 dark:border-green-800"
          style={{ color: 'green', marginBottom: '1rem', textAlign: 'center' }}
        >
          Email verified successfully! Redirecting to login...
        </div>
      )}
      {resendSuccess && (
        <div
          className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-3 rounded-md mb-6 text-sm font-medium border border-green-200 dark:border-green-800"
          style={{ color: 'green', marginBottom: '1rem', textAlign: 'center' }}
        >
          Verification email sent successfully. Please check your inbox.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-1.5 text-foreground" htmlFor="token">
            Verification Token
          </label>
          <input
            id="token"
            type="text"
            className="w-full bg-background border border-[#5f4f4e] dark:border-[#d4d4d4] rounded-md px-4 py-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-shadow shadow-[1px_1px_0px_#5f4f4e] dark:shadow-[1px_1px_0px_#d4d4d4] font-medium"
            placeholder="Paste your token here"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2.5 bg-[#7e6b69] dark:bg-white text-background transition-all rounded-md px-4 py-2.5 text-base font-bold border border-[#5f4f4e] dark:border-[#d4d4d4] shadow-[1px_1px_0px_#5f4f4e] dark:shadow-[1px_1px_0px_#d4d4d4] hover:-translate-y-px hover:shadow-[2px_2px_0px_#5f4f4e] dark:hover:shadow-[2px_2px_0px_#d4d4d4] active:translate-y-px active:shadow-none focus:outline-none mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
          disabled={isLoading || success}
        >
          {isLoading ? 'Verifying...' : 'Verify'}
        </button>
      </form>

      <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #eaeaea' }}>
        <p className="text-foreground/80 mb-6 font-medium" style={{ marginBottom: '1rem' }}>
          Didn&apos;t receive the email?
        </p>
        <div className="mb-4">
          <input
            id="email"
            type="email"
            className="w-full bg-background border border-[#5f4f4e] dark:border-[#d4d4d4] rounded-md px-4 py-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-shadow shadow-[1px_1px_0px_#5f4f4e] dark:shadow-[1px_1px_0px_#d4d4d4] font-medium"
            placeholder="Enter email to resend"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button
          type="button"
          onClick={handleResend}
          className="w-full flex items-center justify-center gap-2.5 bg-[#7e6b69] dark:bg-white text-background transition-all rounded-md px-4 py-2.5 text-base font-bold border border-[#5f4f4e] dark:border-[#d4d4d4] shadow-[1px_1px_0px_#5f4f4e] dark:shadow-[1px_1px_0px_#d4d4d4] hover:-translate-y-px hover:shadow-[2px_2px_0px_#5f4f4e] dark:hover:shadow-[2px_2px_0px_#d4d4d4] active:translate-y-px active:shadow-none focus:outline-none mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
          disabled={isResending || cooldown > 0 || success}
          style={{ backgroundColor: '#f0f0f0', color: '#333' }}
        >
          {isResending
            ? 'Sending...'
            : cooldown > 0
              ? `Resend in ${cooldown}s`
              : 'Resend Verification Email'}
        </button>
      </div>

      <p
        className="mt-6 text-center text-sm font-medium text-foreground/80 flex gap-2 justify-center"
        style={{ marginTop: '1rem' }}
      >
        <Link href="/login" className="text-foreground hover:underline font-bold">
          Back to login
        </Link>
      </p>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-[calc(100vh-42px)] flex items-center justify-center bg-background text-foreground p-8">
      <Suspense
        fallback={
          <div className="w-full max-w-md bg-background border border-[#5f4f4e] dark:border-[#d4d4d4] shadow-[4px_4px_0px_#5f4f4e] dark:shadow-[4px_4px_0px_#d4d4d4] rounded-lg p-8">
            Loading...
          </div>
        }
      >
        <VerifyContent />
      </Suspense>
    </div>
  );
}
