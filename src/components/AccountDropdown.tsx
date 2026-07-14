'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { User as UserIcon, LogIn, UserPlus, LogOut, Settings, BarChart2 } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { AccountPopupButton } from './AccountPopupButton';
import { Popup } from './Popup';
import { useAuth } from '@/lib/AuthContext';

export function AccountDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [isGuestPopupOpen, setIsGuestPopupOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, loading, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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
        className="flex items-center justify-center w-[36px] h-[36px] rounded-md bg-action-btn-bg text-action-btn-text transition-all border border-action-btn-border shadow-[1px_1px_0px_var(--action-btn-border)] hover:-translate-y-px hover:shadow-[2px_2px_0px_var(--action-btn-border)] active:translate-y-px active:shadow-none focus:outline-none"
        aria-label="Account Menu"
      >
        <UserIcon size={18} />
      </button>

      {mounted &&
        createPortal(
          <div
            className={`fixed inset-0 bg-foreground/50 backdrop-blur-sm z-40 sm:hidden transition-all duration-200 ${
              isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
            }`}
            onClick={() => setIsOpen(false)}
          />,
          document.body
        )}

      <div
        className={`absolute right-0 top-[calc(100%+8px)] w-[280px] bg-background text-foreground rounded-xl border-2 border-foreground shadow-[4px_4px_0px_currentColor] p-4 z-50 transition-all duration-200 ease-out origin-top-right ${
          isOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'
        }`}
      >
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
              <AccountPopupButton href="/settings" onClick={() => setIsOpen(false)} icon={Settings}>
                Settings
              </AccountPopupButton>
            </>
          )}

          <ThemeToggle />
          <AccountPopupButton href="/statistics" onClick={() => setIsOpen(false)} icon={BarChart2}>
            Statistics
          </AccountPopupButton>

          {user && !user.is_guest && (
            <AccountPopupButton
              onClick={async () => {
                setIsOpen(false);
                await logout();
              }}
              icon={LogOut}
              className="col-span-2 !flex-row !bg-primary !text-background hover:!bg-primary/90 !border-primary-dark !shadow-[1px_1px_0px_var(--color-primary-dark)] hover:!shadow-[2px_2px_0px_var(--color-primary-dark)]"
            >
              Log out
            </AccountPopupButton>
          )}
        </div>
      </div>

      <Popup
        isOpen={isGuestPopupOpen}
        onClose={() => setIsGuestPopupOpen(false)}
        title="Guest Account"
      >
        <div className="flex flex-col space-y-4">
          <p>You are currently using a guest account.</p>
          <p>
            You can create and study decks, but you will lose access to them when your
            browser&apos;s local storage is cleared.
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
