'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { AlertCircle } from 'lucide-react';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import AuthDivider from '@/components/AuthDivider';

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  oauth_invalid_state: 'Authentication failed. Please try again.',
  oauth_state_expired: 'Authentication session expired. Please try again.',
  oauth_csrf_mismatch: 'Security check failed. Please try again.',
  oauth_no_email: 'Could not retrieve your email from Google.',
  oauth_user_exists: 'An account with this email already exists with a different sign-in method.',
  oauth_user_inactive: 'Your account has been deactivated.',
};

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<React.ReactNode>('');
  const [isLoading, setIsLoading] = useState(false);

  // Show OAuth error messages passed via URL
  useEffect(() => {
    const oauthError = searchParams.get('error');
    if (oauthError && OAUTH_ERROR_MESSAGES[oauthError]) {
      setError(OAUTH_ERROR_MESSAGES[oauthError]);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      setIsLoading(false);
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      setIsLoading(false);
      return;
    }

    try {
      const formData = new URLSearchParams();
      formData.append('username', email); // fastapi_users expects 'username' for email in OAuth2 password flow
      formData.append('password', password);

      const response = await apiFetch(`/api/v1/auth/jwt/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.access_token) {
          localStorage.setItem('jwt_token', data.access_token);
          window.location.href = '/';
        }
      } else {
        const errData = await response.json().catch(() => ({}));
        if (errData.detail === 'USER_NOT_VERIFIED') {
          setError(
            <span>
              Your email is not verified.{' '}
              <Link
                href={`/verify?email=${encodeURIComponent(email)}`}
                style={{ textDecoration: 'underline' }}
              >
                Verify now
              </Link>
            </span>
          );
        } else if (errData.detail === 'LOGIN_BAD_CREDENTIALS') {
          setError('Invalid email or password');
        } else {
          setError(
            typeof errData.detail === 'string' ? errData.detail : 'Invalid email or password'
          );
        }
      }
    } catch (err) {
      setError('An error occurred while logging in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-42px)] flex items-center justify-center bg-background text-foreground p-8">
      <div className="w-full max-w-md bg-background border border-[#5f4f4e] dark:border-[#d4d4d4] shadow-[4px_4px_0px_#5f4f4e] dark:shadow-[4px_4px_0px_#d4d4d4] rounded-lg p-8">
        <h1 className="text-3xl font-extrabold mb-2 text-foreground">Welcome Back</h1>
        <p className="text-foreground/80 mb-6 font-medium">Sign in to continue to Cardie</p>

        {error && (
          <div className="bg-[var(--error)] p-3 rounded-md mb-6 text-sm font-medium text-[var(--error-text)] flex items-start gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        <GoogleSignInButton />

        <AuthDivider />

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

          <div className="mb-4">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="block text-sm font-bold mb-1.5 text-foreground" htmlFor="password">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-foreground hover:underline font-bold"
                style={{ fontSize: '0.875rem' }}
              >
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              className="w-full bg-background border border-[#5f4f4e] dark:border-[#d4d4d4] rounded-md px-4 py-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-shadow shadow-[1px_1px_0px_#5f4f4e] dark:shadow-[1px_1px_0px_#d4d4d4] font-medium"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2.5 bg-[var(--color-primary)] text-[#f7f2e8] transition-all rounded-md px-4 py-2.5 text-base font-bold border border-[#5f4f4e] dark:border-[#d4d4d4] shadow-[1px_1px_0px_#5f4f4e] dark:shadow-[1px_1px_0px_#d4d4d4] hover:-translate-y-px hover:shadow-[2px_2px_0px_#5f4f4e] dark:hover:shadow-[2px_2px_0px_#d4d4d4] active:translate-y-px active:shadow-none focus:outline-none mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm font-medium text-foreground/80 flex gap-2 justify-center">
          Don&apos;t have an account?
          <Link href="/signup" className="text-foreground hover:underline font-bold">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
