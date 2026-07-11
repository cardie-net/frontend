'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from '../auth.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/v1/auth/forgot-password`, {
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
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Reset Password</h1>
        <p className={styles.subtitle}>Enter your email to receive a reset link</p>

        {error && <div className={styles.error}>{error}</div>}
        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div className={styles.success} style={{ color: 'green', marginBottom: '1.5rem' }}>
              Password reset link sent! Please check your email inbox.
            </div>
            <Link
              href="/login"
              className={styles.button}
              style={{ display: 'inline-block', textDecoration: 'none' }}
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                className={styles.input}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className={styles.button} disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        {!success && (
          <p className={styles.linkText} style={{ marginTop: '1.5rem' }}>
            Remember your password?{' '}
            <Link href="/login" className={styles.link}>
              Log in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
