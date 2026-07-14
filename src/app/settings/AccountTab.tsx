'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function AccountTab() {
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await apiFetch('/api/v1/users/me');
        if (response.ok) {
          const data = await response.json();
          setDisplayName(data.display_name || '');
          setUsername(data.username || '');
        }
      } catch (err) {
        console.error('Failed to fetch user', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      const response = await apiFetch('/api/v1/users/me', {
        method: 'PATCH',
        body: JSON.stringify({
          display_name: displayName,
          username: username,
        }),
      });

      if (response.ok) {
        setSuccess('Profile updated successfully.');

        // Update user state if there's any global state, but for now we just show success.
        // The dropdown might need a reload if we don't have global state, but it fetches on mount.
      } else {
        const errData = await response.json().catch(() => ({}));
        if (errData.detail === 'UPDATE_USER_EMAIL_ALREADY_EXISTS') {
          setError('A user with that email already exists.');
        } else {
          setError(
            typeof errData.detail === 'string' ? errData.detail : 'Failed to update profile.'
          );
        }
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="opacity-80 font-medium">Loading account details...</div>;
  }

  return (
    <div className="max-w-md">
      {error && (
        <div className="bg-[var(--error)] p-3 rounded-md mb-6 text-sm font-medium text-[var(--error-text)] flex items-start gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {success && (
        <div className="bg-[var(--success)] p-3 rounded-md mb-6 text-sm font-medium text-[var(--success-text)] flex items-start gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <div>{success}</div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-1.5" htmlFor="displayName">
            Display Name
          </label>
          <Input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-bold mb-1.5" htmlFor="username">
            Username
          </label>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <Button type="submit" className="w-full sm:w-auto" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </div>
  );
}
