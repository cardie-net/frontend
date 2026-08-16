'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import AuthDivider from '@/components/AuthDivider';
import { Card, CardContent } from "@/components/ui/card";

export default function SignupPage() {
  const t = useTranslations('Auth.signup');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t('validEmailRequired'));
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError(t('passwordLength'));
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiFetch(`/api/v1/auth/register`, {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          is_active: true,
          is_superuser: false,
          is_verified: false,
        }),
      });

      if (response.ok) {
        // Redirect to verify page after successful registration
        router.push('/verify');
      } else {
        const errData = await response.json().catch(() => ({}));

        if (errData.detail) {
          if (errData.detail === 'REGISTER_USER_ALREADY_EXISTS') {
            setError(t('userExists'));
          } else if (typeof errData.detail === 'string') {
            setError(errData.detail);
          } else if (Array.isArray(errData.detail)) {
            setError(errData.detail.map((d: { msg: string }) => d.msg).join(', '));
          } else {
            setError(t('registrationFailed'));
          }
        } else {
          setError(t('genericFailed'));
        }
      }
    } catch {
      setError(t('genericError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
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

        <GoogleSignInButton />

        <AuthDivider />

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

          <div className="space-y-2">
            <Label htmlFor="password">{t('passwordLabel')}</Label>
            <Input
              id="password"
              type="password"
              placeholder={t('passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t('creatingAccount') : t('signUp')}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground flex gap-1 justify-center">
          {t('hasAccount')}
          <Link href="/login" className="font-medium hover:underline text-foreground">
            {t('logIn')}
          </Link>
        </p>
        </CardContent>
      </Card>
    </div>
  );
}
