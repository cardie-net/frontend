'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NavbarButton } from './NavbarButton';
import { Layers, PlusSquare, Globe } from 'lucide-react';
import { AccountDropdown } from './AccountDropdown';

export function NavBar() {
  const router = useRouter();

  return (
    <nav className="flex h-[46px] items-center justify-between bg-foreground px-3 text-background z-50">
      {/* Left Navigation */}
      <div className="flex flex-1 items-center gap-2 md:gap-3">
        <NavbarButton href="/decks" icon={Layers} hideTextOnMobile>
          Decks
        </NavbarButton>
        <div className="hidden sm:block">
          <NavbarButton href="/decks/new" icon={PlusSquare}>
            New Deck
          </NavbarButton>
        </div>
        <NavbarButton href="/community" icon={Globe} hideTextOnMobile>
          Community
        </NavbarButton>
      </div>

      {/* Center Logo */}
      <div className="flex-shrink-0 flex items-center justify-center pointer-events-auto z-10 px-2">
        <Link href="/">
          <img
            src="/logo.svg"
            alt="Cardie.net Logo"
            className="h-[24px] dark:invert transition-all"
          />
        </Link>
      </div>

      {/* Right */}
      <div className="flex flex-1 items-center justify-end gap-3 z-10">
        <AccountDropdown />
      </div>
    </nav>
  );
}
