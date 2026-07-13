'use client';

import { useState, useRef, useEffect } from 'react';
import { User as UserIcon, LogIn, UserPlus, LogOut, Settings, BarChart2 } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { AccountPopupButton } from './AccountPopupButton';
import { Popup } from './Popup';
import { apiFetch } from '@/lib/api';

interface UserProfile {
  id: string;
  email: string;
  is_guest: boolean;
  is_active: boolean;
  display_name: string;
  username: string;
}

export function AccountDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [isGuestPopupOpen, setIsGuestPopupOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await apiFetch(`/api/v1/users/me`);

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Close the dropdown when clicking outside of it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-[36px] h-[36px] rounded-md bg-nav-btn-bg text-nav-btn-text transition-all border border-nav-btn-border shadow-[1px_1px_0px_var(--nav-btn-border)] hover:-translate-y-px hover:shadow-[2px_2px_0px_var(--nav-btn-border)] active:translate-y-px active:shadow-none focus:outline-none"
        aria-label="Account Menu"
      >
        <UserIcon size={18} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-[280px] bg-background text-foreground rounded-xl border-2 border-foreground shadow-[4px_4px_0px_currentColor] p-4 z-50">
          <div className="font-bold text-lg mb-3 border-b-2 border-foreground pb-2 flex items-center justify-between">
            <span className="truncate">
              {loading
                ? 'Account Center'
                : user
                  ? user.is_guest
                    ? 'Guest Mode'
                    : user.display_name
                  : 'Account Center'}
            </span>
            {user?.is_guest && (
              <button
                className="flex flex-shrink-0 items-center justify-center w-6 h-6 rounded-full border-2 border-foreground text-xs font-bold hover:bg-foreground/10 transition-colors"
                aria-label="Guest Mode Info"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsGuestPopupOpen(true);
                }}
              >
                ?
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {!user || user.is_guest ? (
              <>
                <AccountPopupButton href="/login" onClick={() => setIsOpen(false)} icon={LogIn}>
                  Log in
                </AccountPopupButton>
                <AccountPopupButton href="/signup" onClick={() => setIsOpen(false)} icon={UserPlus}>
                  Sign up
                </AccountPopupButton>
              </>
            ) : (
              <>
                <AccountPopupButton
                  href={`/profile/${user.username}`}
                  onClick={() => setIsOpen(false)}
                  icon={UserIcon}
                >
                  Profile
                </AccountPopupButton>
                <AccountPopupButton
                  href="/settings"
                  onClick={() => setIsOpen(false)}
                  icon={Settings}
                >
                  Settings
                </AccountPopupButton>
              </>
            )}

            <ThemeToggle />
            <AccountPopupButton
              href="/statistics"
              onClick={() => setIsOpen(false)}
              icon={BarChart2}
            >
              Statistics
            </AccountPopupButton>

            {user && !user.is_guest && (
              <AccountPopupButton
                onClick={async () => {
                  setIsOpen(false);
                  try {
                    await apiFetch('/api/v1/auth/jwt/logout', { method: 'POST' });
                  } catch (error) {
                    console.error('Failed to logout:', error);
                  }
                  localStorage.removeItem('jwt_token');
                  window.location.href = '/';
                }}
                icon={LogOut}
                className="col-span-2 !flex-row text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-500 !border-red-500 !shadow-[1px_1px_0px_currentColor] hover:!shadow-[2px_2px_0px_currentColor] dark:!border-red-400"
              >
                Log out
              </AccountPopupButton>
            )}
          </div>
        </div>
      )}

      <Popup
        isOpen={isGuestPopupOpen}
        onClose={() => setIsGuestPopupOpen(false)}
        title="Guest Account"
      >
        <div className="flex flex-col space-y-4">
          <p>You are currently using a guest account.</p>
          <p>
            You can create and study decks, but you will lose access to them when your browser's
            local storage is cleared.
          </p>
          <p>
            To save your data across devices and keep it safe, please sign up for an account. Its
            free!
          </p>
        </div>
      </Popup>
    </div>
  );
}
