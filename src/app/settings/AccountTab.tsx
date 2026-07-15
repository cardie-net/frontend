'use client';

import { useState, useEffect, useRef } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import {
  AlertCircle,
  CheckCircle2,
  Upload,
  User,
  Trash2,
  Globe,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface SocialLinks {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
  github?: string;
  website?: string;
}

const SOCIAL_PLATFORMS: {
  key: keyof SocialLinks;
  label: string;
  icon: React.ReactNode;
  placeholder: string;
}[] = [
  {
    key: 'website',
    label: 'Website',
    icon: <Globe className="w-4 h-4" />,
    placeholder: 'https://yourwebsite.com',
  },
  {
    key: 'github',
    label: 'GitHub',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
      </svg>
    ),
    placeholder: 'https://github.com/username',
  },
  {
    key: 'twitter',
    label: 'X (Twitter)',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    placeholder: 'https://x.com/username',
  },
  {
    key: 'instagram',
    label: 'Instagram',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
    placeholder: 'https://instagram.com/username',
  },
  {
    key: 'youtube',
    label: 'YouTube',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    placeholder: 'https://youtube.com/@channel',
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    placeholder: 'https://linkedin.com/in/username',
  },
  {
    key: 'tiktok',
    label: 'TikTok',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.51a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.98a8.21 8.21 0 0 0 4.76 1.52V7.05a4.84 4.84 0 0 1-1-.36z" />
      </svg>
    ),
    placeholder: 'https://tiktok.com/@username',
  },
  {
    key: 'facebook',
    label: 'Facebook',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    placeholder: 'https://facebook.com/username',
  },
];

const BIO_MAX_LENGTH = 500;

export default function AccountTab() {
  const { refreshUser } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({});
  const [socialLinksExpanded, setSocialLinksExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await apiFetch('/api/v1/users/me');
        if (response.ok) {
          const data = await response.json();
          setDisplayName(data.display_name || '');
          setUsername(data.username || '');
          setAvatarUrl(data.avatar_url || '');
          setBio(data.bio || '');
          setSocialLinks(data.social_links || {});
          // Auto-expand social links section if user already has links
          if (data.social_links && Object.keys(data.social_links).length > 0) {
            setSocialLinksExpanded(true);
          }
        }
      } catch (err) {
        console.error('Failed to fetch user', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiFetch('/api/v1/users/me/avatar', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setAvatarUrl(data.avatar_url || '');
        setSuccess('Profile picture updated successfully.');
        await refreshUser();
      } else {
        const errData = await response.json().catch(() => ({}));
        setError(
          typeof errData.detail === 'string' ? errData.detail : 'Failed to upload profile picture.'
        );
      }
    } catch {
      setError('An error occurred while uploading. Please try again.');
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = async () => {
    setIsUploadingAvatar(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiFetch('/api/v1/users/me/avatar', {
        method: 'DELETE',
      });

      if (response.ok) {
        setAvatarUrl('');
        setSuccess('Profile picture removed successfully.');
        await refreshUser();
      } else {
        const errData = await response.json().catch(() => ({}));
        setError(
          typeof errData.detail === 'string' ? errData.detail : 'Failed to remove profile picture.'
        );
      }
    } catch {
      setError('An error occurred while removing. Please try again.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSocialLinkChange = (key: keyof SocialLinks, value: string) => {
    setSocialLinks((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (username.length < 8) {
      setError('Username must be at least 8 characters long.');
      return;
    }
    if (username.length > 32) {
      setError('Username must be no more than 32 characters long.');
      return;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      setError('Username can only contain letters, numbers, underscores, and dashes.');
      return;
    }
    if (bio.length > BIO_MAX_LENGTH) {
      setError(`Bio must be ${BIO_MAX_LENGTH} characters or fewer.`);
      return;
    }

    // Validate social link URLs
    const urlPattern = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
    for (const platform of SOCIAL_PLATFORMS) {
      const value = socialLinks[platform.key];
      if (value && !urlPattern.test(value)) {
        setError(`Invalid URL for ${platform.label}. URLs must start with http:// or https://`);
        return;
      }
    }

    setIsSaving(true);

    // Build social_links payload: only include non-empty values
    const cleanSocialLinks: SocialLinks = {};
    let hasSocialLinks = false;
    for (const platform of SOCIAL_PLATFORMS) {
      const value = socialLinks[platform.key];
      if (value && value.trim()) {
        cleanSocialLinks[platform.key] = value.trim();
        hasSocialLinks = true;
      }
    }

    try {
      const response = await apiFetch('/api/v1/users/me', {
        method: 'PATCH',
        body: JSON.stringify({
          display_name: displayName,
          username: username,
          bio: bio || null,
          social_links: hasSocialLinks ? cleanSocialLinks : null,
        }),
      });

      if (response.ok) {
        setSuccess('Profile updated successfully.');
        await refreshUser();
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

  const filledLinksCount = Object.values(socialLinks).filter((v) => v && v.trim()).length;

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

      <div className="mb-6 flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-[var(--surface-color)] overflow-hidden flex items-center justify-center border-2 border-[var(--border-color)] shrink-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <User className="w-10 h-10 text-[var(--muted-text)]" />
          )}
        </div>
        <div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            disabled={isUploadingAvatar}
          />
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
            >
              <Upload className="w-4 h-4" />
              {isUploadingAvatar ? 'Uploading...' : 'Upload Avatar'}
            </Button>
            {avatarUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={handleRemoveAvatar}
                disabled={isUploadingAvatar}
                aria-label="Remove Avatar"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
          <p className="text-xs opacity-70 mt-2">Recommended: Square image, max 2MB.</p>
        </div>
      </div>

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

        <div className="mb-4">
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

        {/* Bio */}
        <div className="mb-4">
          <label className="block text-sm font-bold mb-1.5" htmlFor="bio">
            Bio
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={BIO_MAX_LENGTH}
            rows={3}
            placeholder="Tell others a bit about yourself..."
            className="w-full bg-background border border-border-heavy rounded-md px-4 py-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-shadow shadow-[1px_1px_0px_var(--color-border-heavy)] font-medium resize-y min-h-[80px]"
          />
          <div className="flex justify-end mt-1">
            <span
              className={`text-xs font-medium transition-colors ${
                bio.length > BIO_MAX_LENGTH * 0.9
                  ? bio.length >= BIO_MAX_LENGTH
                    ? 'text-[var(--error)]'
                    : 'text-[var(--warning)]'
                  : 'opacity-50'
              }`}
            >
              {bio.length}/{BIO_MAX_LENGTH}
            </span>
          </div>
        </div>

        {/* Social Links */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setSocialLinksExpanded(!socialLinksExpanded)}
            className="flex items-center gap-2 text-sm font-bold mb-3 w-full text-left group cursor-pointer"
          >
            <span>Social Links</span>
            {filledLinksCount > 0 && (
              <span className="text-xs font-semibold bg-[var(--accent)] text-[var(--background)] px-1.5 py-0.5 rounded-full">
                {filledLinksCount}
              </span>
            )}
            <span className="ml-auto opacity-60 group-hover:opacity-100 transition-opacity">
              {socialLinksExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </span>
          </button>

          {socialLinksExpanded && (
            <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
              {SOCIAL_PLATFORMS.map((platform) => (
                <div key={platform.key} className="flex items-center gap-2">
                  <div
                    className="shrink-0 w-8 h-8 rounded-md bg-[var(--foreground)]/10 flex items-center justify-center"
                    title={platform.label}
                  >
                    {platform.icon}
                  </div>
                  <Input
                    id={`social-${platform.key}`}
                    type="url"
                    value={socialLinks[platform.key] || ''}
                    onChange={(e) => handleSocialLinkChange(platform.key, e.target.value)}
                    placeholder={platform.placeholder}
                    className="text-sm"
                  />
                </div>
              ))}
              <p className="text-xs opacity-60 mt-1">
                All links must start with http:// or https://
              </p>
            </div>
          )}
        </div>

        <Button type="submit" className="w-full sm:w-auto" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </div>
  );
}
