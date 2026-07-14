'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import AuthDivider from '@/components/AuthDivider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { useAuth } from '@/lib/AuthContext';

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  oauth_invalid_state: 'Authentication failed. Please try again',
  oauth_state_expired: 'Authentication session expired. Please try again',
  oauth_csrf_mismatch: 'Security check failed. Please try again',
  oauth_no_email: 'Could not retrieve your email from Google',
  oauth_profile_error: 'Could not retrieve your Google profile',
  oauth_user_exists: 'An account with this email already exists with a different sign-in method',
  oauth_user_inactive: 'Your account has been deactivated',
};

function LoginContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<React.ReactNode>('');
  const [isLoading, setIsLoading] = useState(false);
  const { refreshUser } = useAuth();

  // Show OAuth error messages passed via URL
  useEffect(() => {
    const oauthError = searchParams.get('error');
    if (oauthError && OAUTH_ERROR_MESSAGES[oauthError]) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
        await refreshUser();
        window.location.href = '/';
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
    } catch {
      setError('An error occurred while logging in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-foreground text-background border-2 border-border-heavy rounded-lg p-6 sm:p-8 shadow-[8px_8px_0px_var(--color-border-heavy)]">
      <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">Welcome Back</h1>
      <p className="opacity-80 mb-6 font-medium">Sign in to continue to Cardie</p>

      {error && <Alert className="mb-6">{error}</Alert>}

      <GoogleSignInButton />

      <AuthDivider />

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-1.5" htmlFor="email">
            Email address
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="block text-sm font-bold mb-1.5" htmlFor="password">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="hover:underline font-bold"
              style={{ fontSize: '0.875rem' }}
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full mt-6" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <p className="mt-6 text-center text-xs sm:text-sm font-medium opacity-80 flex gap-1 sm:gap-2 justify-center">
        Don&apos;t have an account?
        <Link href="/signup" className="hover:underline font-bold text-background">
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex-1 flex items-center justify-center text-foreground p-4 sm:p-8">
      <Suspense
        fallback={
          <div className="w-full max-w-md bg-foreground text-background border-2 border-border-heavy rounded-lg p-6 sm:p-8 shadow-[8px_8px_0px_var(--color-border-heavy)] text-center font-bold">
            Loading...
          </div>
        }
      >
        <LoginContent />
      </Suspense>
    </div>
  );
}
