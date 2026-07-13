'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * Handles the OAuth callback from Google.
 *
 * The backend redirects here with either:
 *   ?token=<jwt>  — on success
 *   ?error=<code> — on failure
 *
 * On success, stores the JWT and redirects to the home page.
 * On failure, redirects to /login with the error.
 */
export default function GoogleCallbackPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (token) {
      localStorage.setItem('jwt_token', token);
      window.location.href = '/';
      return;
    }

    if (error) {
      setStatus('error');
      setErrorMessage(getErrorMessage(error));

      // Redirect to login after a brief delay so the user sees the message
      setTimeout(() => {
        window.location.href = `/login?error=${encodeURIComponent(error)}`;
      }, 2000);
    }
  }, [searchParams]);

  if (status === 'error') {
    return (
      <div className="min-h-[calc(100vh-42px)] flex items-center justify-center bg-background text-foreground p-8">
        <div className="text-center">
          <p className="text-lg font-bold mb-2">Sign-in failed</p>
          <p className="text-foreground/80 font-medium">{errorMessage}</p>
          <p className="text-foreground/60 text-sm mt-2">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-42px)] flex items-center justify-center bg-background text-foreground p-8">
      <div className="text-center">
        <div className="inline-block w-6 h-6 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin mb-4" />
        <p className="text-lg font-bold">Signing you in...</p>
      </div>
    </div>
  );
}

function getErrorMessage(error: string): string {
  const messages: Record<string, string> = {
    oauth_invalid_state: 'Invalid authentication state. Please try again.',
    oauth_state_expired: 'Authentication session expired. Please try again.',
    oauth_csrf_mismatch: 'Security check failed. Please try again.',
    oauth_no_email: 'Could not retrieve your email from Google.',
    oauth_profile_error:
      'Could not retrieve your Google profile. Please make sure the Google People API is enabled in Google Cloud Console.',
    oauth_user_exists: 'An account with this email already exists with a different sign-in method.',
    oauth_user_inactive: 'Your account has been deactivated.',
  };

  return messages[error] || 'An unexpected error occurred. Please try again.';
}
