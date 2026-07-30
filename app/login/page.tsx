'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
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
      formData.append('username', email); // fastapi_users expects 'username' for email
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
                className="underline"
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
    <div className="w-full max-w-md bg-background text-foreground border rounded-lg p-6 sm:p-8 shadow-sm">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome Back</h1>
      <p className="text-muted-foreground mb-6">Sign in to continue</p>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-sm font-medium hover:underline text-muted-foreground"
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

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground flex gap-1 justify-center">
        Don&apos;t have an account?
        <Link href="/signup" className="font-medium hover:underline text-foreground">
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="w-full max-w-md bg-background border rounded-lg p-6 sm:p-8 text-center">
            Loading...
          </div>
        }
      >
        <LoginContent />
      </Suspense>
    </div>
  );
}
