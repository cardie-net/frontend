'use client';
import { useState } from 'react';
import { Logo } from './Logo';
import { NavLinks } from './NavLinks';
import { AccountActions } from './AccountActions';

interface MobileNavProps {
  isLoggedIn: boolean;
  onLogout: () => void;
}

export function MobileNav({ isLoggedIn, onLogout }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between w-full h-16 px-4 bg-background border-b border-accent/20 relative z-50 shadow-sm">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-foreground hover:text-primary transition-colors focus:outline-none rounded-md"
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          )}
        </button>

        <div className="absolute left-1/2 -translate-x-1/2">
          <Logo />
        </div>

        <div>
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 text-foreground hover:text-primary transition-colors rounded-md"
            aria-label="Account"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              ></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Full Screen Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-background pt-16 flex flex-col animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex-1 px-6 py-8 overflow-y-auto">
            <div className="mb-10">
              <h3 className="text-xs font-bold text-accent uppercase tracking-wider mb-4 border-b border-accent/20 pb-2">
                Navigation
              </h3>
              <NavLinks className="flex-col gap-4" onClick={() => setIsOpen(false)} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-accent uppercase tracking-wider mb-4 border-b border-accent/20 pb-2">
                Account
              </h3>
              <AccountActions
                isLoggedIn={isLoggedIn}
                onLogout={() => {
                  onLogout();
                  setIsOpen(false);
                }}
                isMobile
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
