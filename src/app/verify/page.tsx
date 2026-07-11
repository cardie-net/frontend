'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from '../auth.module.css';

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
      const response = await fetch(`/api/v1/auth/request-verify-token`, {
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
      const response = await fetch(`/api/v1/auth/verify`, {
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
    <div className={styles.card}>
      <h1 className={styles.title}>Verify Email</h1>
      <p className={styles.subtitle}>Enter your verification token</p>

      {error && <div className={styles.error}>{error}</div>}
      {success && (
        <div
          className={styles.success}
          style={{ color: 'green', marginBottom: '1rem', textAlign: 'center' }}
        >
          Email verified successfully! Redirecting to login...
        </div>
      )}
      {resendSuccess && (
        <div
          className={styles.success}
          style={{ color: 'green', marginBottom: '1rem', textAlign: 'center' }}
        >
          Verification email sent successfully. Please check your inbox.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="token">
            Verification Token
          </label>
          <input
            id="token"
            type="text"
            className={styles.input}
            placeholder="Paste your token here"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
          />
        </div>

        <button type="submit" className={styles.button} disabled={isLoading || success}>
          {isLoading ? 'Verifying...' : 'Verify'}
        </button>
      </form>

      <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #eaeaea' }}>
        <p className={styles.subtitle} style={{ marginBottom: '1rem' }}>
          Didn&apos;t receive the email?
        </p>
        <div className={styles.formGroup}>
          <input
            id="email"
            type="email"
            className={styles.input}
            placeholder="Enter email to resend"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button
          type="button"
          onClick={handleResend}
          className={styles.button}
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

      <p className={styles.linkText} style={{ marginTop: '1rem' }}>
        <Link href="/login" className={styles.link}>
          Back to login
        </Link>
      </p>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className={styles.container}>
      <Suspense fallback={<div className={styles.card}>Loading...</div>}>
        <VerifyContent />
      </Suspense>
    </div>
  );
}
