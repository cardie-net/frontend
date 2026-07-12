'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { NavbarButton } from './NavbarButton';
import { Home, Layers, Menu, X } from 'lucide-react';
import { AccountDropdown } from './AccountDropdown';

export function NavBar() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  return (
    <nav className="flex h-[46px] relative items-center justify-between bg-foreground px-3 text-background z-50">
      {/* Desktop Left */}
      <div className="hidden md:flex items-center gap-3">
        <NavbarButton href="/" icon={Home}>
          Home
        </NavbarButton>
        <NavbarButton href="/decks" icon={Layers}>
          Decks
        </NavbarButton>
      </div>

      {/* Mobile Left */}
      <div className="flex md:hidden items-center">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-1 hover:opacity-80 transition-opacity"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <Link
        href="/"
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-auto z-10"
      >
        <img
          src="/logo.svg"
          alt="Cardie.net Logo"
          className="h-[24px] dark:invert transition-all"
        />
      </Link>

      {/* Right */}
      <div className="flex items-center gap-3 z-10">
        <ThemeToggle />
        <AccountDropdown />
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 top-[46px] bg-background text-foreground z-40 flex flex-col items-center pt-12 gap-6 md:hidden">
          <NavbarButton href="/" icon={Home} onClick={() => setIsMenuOpen(false)}>
            Home
          </NavbarButton>
          <NavbarButton href="/decks" icon={Layers} onClick={() => setIsMenuOpen(false)}>
            Decks
          </NavbarButton>
        </div>
      )}
    </nav>
  );
}
