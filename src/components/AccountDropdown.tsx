'use client';

import { useState, useRef, useEffect } from 'react';
import { User, LogIn, UserPlus, LogOut, Settings } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';

export function AccountDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
        <User size={18} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-[280px] bg-background text-foreground rounded-xl border-2 border-foreground shadow-[4px_4px_0px_currentColor] p-4 z-50">
          <div className="font-bold text-lg mb-3 border-b-2 border-foreground pb-2">
            Account Center
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg border-2 border-foreground hover:bg-foreground/5 transition-colors"
            >
              <LogIn size={24} />
              <span className="text-sm font-bold">Log in</span>
            </Link>

            <Link
              href="/signup"
              onClick={() => setIsOpen(false)}
              className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg border-2 border-foreground hover:bg-foreground/5 transition-colors"
            >
              <UserPlus size={24} />
              <span className="text-sm font-bold">Sign up</span>
            </Link>

            {/* Placeholder for future conditional rendering based on auth state */}
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg border-2 border-foreground hover:bg-foreground/5 transition-colors"
            >
              <Settings size={24} />
              <span className="text-sm font-bold">Settings</span>
            </Link>

            <button
              onClick={() => setIsOpen(false)}
              className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg border-2 border-foreground hover:bg-foreground/5 transition-colors text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-500"
            >
              <LogOut size={24} />
              <span className="text-sm font-bold">Log out</span>
            </button>

            <ThemeToggle />
          </div>
        </div>
      )}
    </div>
  );
}
