'use client';

import { useState, useRef, useEffect } from 'react';
import { User as UserIcon, LogIn, UserPlus, LogOut, Settings } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { AccountPopupButton } from './AccountPopupButton';

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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/v1/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

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
        className="flex items-center justify-center w-[36px] h-[36px] rounded-md bg-[#7e6b69] dark:bg-white text-background transition-all border border-[#5f4f4e] dark:border-[#d4d4d4] shadow-[1px_1px_0px_#5f4f4e] dark:shadow-[1px_1px_0px_#d4d4d4] hover:-translate-y-px hover:shadow-[2px_2px_0px_#5f4f4e] dark:hover:shadow-[2px_2px_0px_#d4d4d4] active:translate-y-px active:shadow-none focus:outline-none"
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
              >
                ?
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <AccountPopupButton href="/login" onClick={() => setIsOpen(false)} icon={LogIn}>
              Log in
            </AccountPopupButton>

            <AccountPopupButton href="/signup" onClick={() => setIsOpen(false)} icon={UserPlus}>
              Sign up
            </AccountPopupButton>

            {/* Placeholder for future conditional rendering based on auth state */}
            <AccountPopupButton href="/settings" onClick={() => setIsOpen(false)} icon={Settings}>
              Settings
            </AccountPopupButton>

            <AccountPopupButton
              onClick={() => setIsOpen(false)}
              icon={LogOut}
              className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-500 !border-red-500 !shadow-[1px_1px_0px_currentColor] hover:!shadow-[2px_2px_0px_currentColor] dark:!border-red-400"
            >
              Log out
            </AccountPopupButton>

            <ThemeToggle />
          </div>
        </div>
      )}
    </div>
  );
}
