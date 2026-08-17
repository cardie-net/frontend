'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { apiFetch } from '@/lib/api';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const t = useTranslations('Auth.forgotPassword');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t('validEmailRequired'));
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiFetch(`/api/v1/auth/forgot-password`, {
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
        if (errData.detail === 'USER_NOT_EXISTS') {
          setError(t('userNotFound'));
        } else {
          setError(
            typeof errData.detail === 'string' ? errData.detail : t('failed')
          );
        }
      }
    } catch {
      setError(t('genericError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
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

        {success ? (
          <div className="text-center">
            <Alert className="mb-6 flex gap-2 text-left border-green-500 text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              <AlertDescription>{t('linkSent')}</AlertDescription>
            </Alert>
            <Link href="/login" className="w-full block">
              <Button className="w-full">{t('returnToLogin')}</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('emailLabel')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t('sending') : t('sendLink')}
            </Button>
          </form>
        )}

        {!success && (
          <p className="mt-6 text-center text-sm text-muted-foreground flex gap-1 justify-center">
            {t('rememberPassword')}{' '}
            <Link href="/login" className="font-medium hover:underline text-foreground">
              {t('logIn')}
            </Link>
          </p>
        )}
        </CardContent>
      </Card>
    </div>
  );
}
