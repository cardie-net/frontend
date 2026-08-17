'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { apiFetch } from '@/lib/api';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from "@/components/ui/card";

function VerifyContent() {
  const t = useTranslations('Auth.verify');
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
      setError(t('validEmailRequired'));
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
        setError(t('resendFailed'));
      }
    } catch {
      setError(t('genericError'));
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!token.trim()) {
      setError(t('tokenRequired'));
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
            setError(t('badToken'));
          } else if (errData.detail === 'VERIFY_USER_ALREADY_VERIFIED') {
            setError(t('alreadyVerified'));
          } else {
            setError(typeof errData.detail === 'string' ? errData.detail : t('failed'));
          }
        } else {
          setError(t('failed'));
        }
      }
    } catch {
      setError(t('genericError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md rounded-3xl border-border/80 shadow-md bg-card overflow-hidden">
      <CardContent className="p-6 sm:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2">{t('title')}</h1>
      <p className="text-muted-foreground mb-6">{t('subtitle')}</p>

      {error && (
        <Alert variant="destructive" className="mb-6 flex gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="mb-6 flex gap-2 text-left border-green-500 text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400">
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          <AlertDescription>{t('successMessage')}</AlertDescription>
        </Alert>
      )}
      {resendSuccess && (
        <Alert className="mb-6 flex gap-2 text-left border-green-500 text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400">
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          <AlertDescription>{t('resendSuccess')}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="token">{t('tokenLabel')}</Label>
          <Input
            id="token"
            type="text"
            placeholder={t('tokenPlaceholder')}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading || success}>
          {isLoading ? t('verifying') : t('verify')}
        </Button>
      </form>

      <div className="mt-8 pt-4 border-t">
        <p className="text-muted-foreground mb-4">{t('didntReceive')}</p>
        <div className="space-y-4">
          <Input
            id="email"
            type="email"
            placeholder={t('resendEmailPlaceholder')}
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
              ? t('verifying')
              : cooldown > 0
                ? t('resendIn', { seconds: cooldown })
                : t('resendButton')}
          </Button>
        </div>
      </div>

      <p className="mt-4 text-center text-sm text-muted-foreground flex gap-1 justify-center">
        <Link href="/login" className="font-medium hover:underline text-foreground">
          {t('backToLogin')}
        </Link>
      </p>
      </CardContent>
    </Card>
  );
}

export default function VerifyPage() {
  const tCommon = useTranslations('Common');

  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <Suspense
        fallback={
          <Card className="w-full max-w-md rounded-3xl border-border/80 shadow-md bg-card overflow-hidden">
            <CardContent className="p-6 sm:p-8 text-center text-muted-foreground">
              {tCommon('loading')}
            </CardContent>
          </Card>
        }
      >
        <VerifyContent />
      </Suspense>
    </div>
  );
}
