'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { AlertCircle } from 'lucide-react';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import AuthDivider from '@/components/AuthDivider';

import { Button } from '@/components/ui/Button';

export default function SignupPage() {
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
      setError('Please enter a valid email address.');
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
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

        // Handle fastapi_users validation errors
        if (errData.detail) {
          if (errData.detail === 'REGISTER_USER_ALREADY_EXISTS') {
            setError('A user with this email already exists');
          } else if (typeof errData.detail === 'string') {
            setError(errData.detail);
          } else if (Array.isArray(errData.detail)) {
            setError(errData.detail.map((d: { msg: string }) => d.msg).join(', '));
          } else {
            setError('Registration failed. Please check your inputs.');
          }
        } else {
          setError('Registration failed.');
        }
      }
    } catch {
      setError('An error occurred during registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-background text-foreground p-8">
      <div className="w-full max-w-md bg-foreground text-background border-2 border-border-heavy shadow-[8px_8px_0px_var(--color-border-heavy)] rounded-lg p-8">
        <h1 className="text-3xl font-extrabold mb-2">Create Account</h1>
        <p className="opacity-80 mb-6 font-medium">Join Cardie to start learning</p>

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
            <label className="block text-sm font-bold mb-1.5" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              type="email"
              className="w-full bg-background border border-border-heavy rounded-md px-4 py-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-shadow shadow-[1px_1px_0px_var(--color-border-heavy)] font-medium"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-bold mb-1.5" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full bg-background border border-border-heavy rounded-md px-4 py-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-shadow shadow-[1px_1px_0px_var(--color-border-heavy)] font-medium"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <Button type="submit" className="w-full mt-6" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm font-medium opacity-80 flex gap-2 justify-center">
          Already have an account?
          <Link href="/login" className="hover:underline font-bold text-background">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
