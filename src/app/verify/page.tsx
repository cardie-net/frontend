'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/config';
import styles from '../auth.module.css';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
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
