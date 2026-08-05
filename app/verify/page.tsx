'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from "@/components/ui/card";

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
    <Card className="w-full max-w-md rounded-3xl border-border/80 shadow-md bg-card/95 backdrop-blur-2xl overflow-hidden">
      <CardContent className="p-6 sm:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2">Verify Email</h1>
      <p className="text-muted-foreground mb-6">Enter your verification token</p>

      {error && (
        <Alert variant="destructive" className="mb-6 flex gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="mb-6 flex gap-2 text-left border-green-500 text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400">
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          <AlertDescription>Email verified successfully! Redirecting to login...</AlertDescription>
        </Alert>
      )}
      {resendSuccess && (
        <Alert className="mb-6 flex gap-2 text-left border-green-500 text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400">
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          <AlertDescription>Verification email sent successfully. Please check your inbox.</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="token">Verification Token</Label>
          <Input
            id="token"
            type="text"
            placeholder="Paste your token here"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading || success}>
          {isLoading ? 'Verifying...' : 'Verify'}
        </Button>
      </form>

      <div className="mt-8 pt-4 border-t">
        <p className="text-muted-foreground mb-4">Didn&apos;t receive the email?</p>
        <div className="space-y-4">
          <Input
            id="email"
            type="email"
            placeholder="Enter email to resend"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleResend}
            disabled={isResending || cooldown > 0 || success}
          >
            {isResending
              ? 'Sending...'
              : cooldown > 0
                ? `Resend in ${cooldown}s`
                : 'Resend Verification Email'}
          </Button>
        </div>
      </div>

      <p className="mt-4 text-center text-sm text-muted-foreground flex gap-1 justify-center">
        <Link href="/login" className="font-medium hover:underline text-foreground">
          Back to login
        </Link>
      </p>
      </CardContent>
    </Card>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Suspense
        fallback={
          <Card className="w-full max-w-md rounded-3xl border-border/80 shadow-md bg-card/95 backdrop-blur-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8 text-center text-muted-foreground">
              Loading...
            </CardContent>
          </Card>
        }
      >
        <VerifyContent />
      </Suspense>
    </div>
  );
}
