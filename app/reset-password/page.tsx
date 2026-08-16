'use client';

import { useState, Suspense } from 'react';
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

function ResetPasswordContent() {
  const t = useTranslations('Auth.resetPassword');
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

    if (password.length < 8) {
      setError(t('passwordLength'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('passwordsDontMatch'));
      return;
    }

    setSuccess(false);
    setIsLoading(true);

    try {
      const response = await apiFetch(`/api/v1/auth/reset-password`, {
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
        if (errData.detail === 'RESET_PASSWORD_BAD_TOKEN') {
          setError(t('badToken'));
        } else {
          setError(
            typeof errData.detail === 'string'
              ? errData.detail
              : t('failed')
          );
        }
      }
    } catch {
      setError(t('genericError'));
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-md rounded-3xl border-border/80 shadow-md bg-card overflow-hidden">
        <CardContent className="p-6 sm:p-8">
        <div className="text-center">
          <Alert className="mb-6 flex gap-2 text-left border-green-500 text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400">
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            <AlertDescription>{t('successMessage')}</AlertDescription>
          </Alert>
          <Link href="/login" className="w-full block">
            <Button className="w-full">{t('goToLogin')}</Button>
          </Link>
        </div>
        </CardContent>
      </Card>
    );
  }

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

        <div className="space-y-2">
          <Label htmlFor="password">{t('newPasswordLabel')}</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{t('confirmPasswordLabel')}</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? t('resetting') : t('resetPassword')}
        </Button>
      </form>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  const tCommon = useTranslations('Common');

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Suspense
        fallback={
          <Card className="w-full max-w-md rounded-3xl border-border/80 shadow-md bg-card overflow-hidden">
            <CardContent className="p-6 sm:p-8 text-center text-muted-foreground">
              {tCommon('loading')}
            </CardContent>
          </Card>
        }
      >
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
