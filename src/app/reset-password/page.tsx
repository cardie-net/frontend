'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from '../auth.module.css';

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

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSuccess(false);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/v1/auth/reset-password`, {
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
        setError(
          typeof errData.detail === 'string'
            ? errData.detail
            : 'Failed to reset password. Invalid or expired token.'
        );
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className={styles.card}>
        <div style={{ textAlign: 'center' }}>
          <div className={styles.success} style={{ color: 'green', marginBottom: '1.5rem' }}>
            Password reset successfully! Redirecting to login...
          </div>
          <Link
            href="/login"
            className={styles.button}
            style={{ display: 'inline-block', textDecoration: 'none' }}
          >
            Go to Login now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <h1 className={styles.title}>Set New Password</h1>
      <p className={styles.subtitle}>Enter your token and new password</p>

      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="token">
            Reset Token
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

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="password">
            New Password
          </label>
          <input
            id="password"
            type="password"
            className={styles.input}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="confirmPassword">
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            className={styles.input}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>

        <button type="submit" className={styles.button} disabled={isLoading}>
          {isLoading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className={styles.container}>
      <Suspense fallback={<div className={styles.card}>Loading...</div>}>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
