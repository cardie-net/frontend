'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { cn } from '@/lib/utils';
import {
  Menu,
  X,
  BookOpen,
  Settings,
  User,
  UserCircle,
  LogIn,
  UserPlus,
  LogOut,
  Home,
} from 'lucide-react';

type CornerPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

interface CustomTooltipProps {
  text: string;
  isBottomSide: boolean;
}

function CustomTooltip({ text, isBottomSide }: CustomTooltipProps) {
  return (
    <div
      className={cn(
        'absolute left-1/2 -translate-x-1/2 px-2.5 py-1 text-xs font-medium rounded-lg shadow-xl whitespace-nowrap pointer-events-none transition-all duration-200 z-50',
        'bg-zinc-900/90 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 border border-zinc-700/50 dark:border-zinc-300/50 backdrop-blur-md',
        'opacity-0 group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 scale-95 origin-center',
        isBottomSide ? 'bottom-full mb-3' : 'top-full mt-3'
      )}
    >
      {text}
      <div
        className={cn(
          'absolute left-1/2 -translate-x-1/2 border-4 border-transparent',
          isBottomSide
            ? 'top-full border-t-zinc-900/90 dark:border-t-zinc-100'
            : 'bottom-full border-b-zinc-900/90 dark:border-b-zinc-100'
        )}
      />
    </div>
  );
}

interface NavItemProps {
  href?: string;
  onClick?: () => void;
  icon: React.ReactNode;
  tooltip: string;
  isActive?: boolean;
  isBottomSide: boolean;
  className?: string;
}

function NavItem({
  href,
  onClick,
  icon,
  tooltip,
  isActive = false,
  isBottomSide,
  className,
}: NavItemProps) {
  const content = (
    <div
      className={cn(
        'relative group/tooltip flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200',
        isActive
          ? 'bg-primary text-primary-foreground shadow-md scale-105'
          : 'text-muted-foreground hover:text-foreground hover:bg-accent/80 hover:scale-105 active:scale-95',
        className
      )}
    >
      {icon}
      <CustomTooltip text={tooltip} isBottomSide={isBottomSide} />
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return (
    <button type="button" onClick={onClick} className="focus:outline-none">
      {content}
    </button>
  );
}

export function Navbar() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();

  const [corner, setCorner] = useState<CornerPosition>('top-right');
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [isAccountHovered, setIsAccountHovered] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const startPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const offsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const movedFarRef = useRef(false);

  // Load saved corner preference from localStorage
  useEffect(() => {
    void Promise.resolve().then(() => {
      const saved = localStorage.getItem('cardie_navbar_corner') as CornerPosition | null;
      if (saved && ['top-left', 'top-right', 'bottom-left', 'bottom-right'].includes(saved)) {
        setCorner(saved);
      }
    });
  }, []);

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent | TouchEvent) {
      if (
        isOpen &&
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setIsAccountHovered(false);
      }
    }

    document.addEventListener('pointerdown', handleClickOutside);
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle Drag Pointer Events
  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    // Only left-click / primary touch
    if (e.button !== 0) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    startPointerRef.current = { x: e.clientX, y: e.clientY };
    offsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    movedFarRef.current = false;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startPointerRef.current.x;
      const dy = moveEvent.clientY - startPointerRef.current.y;

      if (dx * dx + dy * dy > 25) {
        movedFarRef.current = true;
      }

      setDragPos({
        x: moveEvent.clientX - offsetRef.current.x,
        y: moveEvent.clientY - offsetRef.current.y,
      });
      setIsDragging(true);
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);

      setIsDragging(false);

      if (!movedFarRef.current) {
        // Simple click -> Toggle open state
        setIsOpen((prev) => !prev);
      } else {
        // Drag end -> calculate closest corner
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const currentX = upEvent.clientX - offsetRef.current.x + rect.width / 2;
        const currentY = upEvent.clientY - offsetRef.current.y + rect.height / 2;

        const isLeft = currentX < windowWidth / 2;
        const isTop = currentY < windowHeight / 2;

        const newCorner: CornerPosition = isTop
          ? isLeft
            ? 'top-left'
            : 'top-right'
          : isLeft
            ? 'bottom-left'
            : 'bottom-right';

        setCorner(newCorner);
        localStorage.setItem('cardie_navbar_corner', newCorner);
      }

      setDragPos(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const isRightSide = corner === 'top-right' || corner === 'bottom-right';
  const isBottomSide = corner === 'bottom-left' || corner === 'bottom-right';

  const cornerClasses: Record<CornerPosition, string> = {
    'top-left': 'top-6 left-6',
    'top-right': 'top-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'bottom-right': 'bottom-6 right-6',
  };

  const isAuthenticated = !loading && user && !user.is_guest;

  return (
    <div
      ref={containerRef}
      style={
        dragPos
          ? {
              position: 'fixed',
              left: `${dragPos.x}px`,
              top: `${dragPos.y}px`,
            }
          : undefined
      }
      className={cn(
        'fixed z-50 flex items-center gap-2.5 touch-none select-none',
        !dragPos && cornerClasses[corner],
        !isDragging && 'transition-all duration-300 ease-out',
        isRightSide ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Circle Hamburger Handle */}
      <button
        type="button"
        onPointerDown={handlePointerDown}
        aria-label="Toggle menu"
        className={cn(
          'group relative w-12 h-12 rounded-full flex items-center justify-center',
          'bg-background/85 dark:bg-zinc-900/85 backdrop-blur-xl border border-border/70 shadow-lg shadow-black/10 dark:shadow-black/40',
          'hover:scale-105 active:scale-95 transition-all duration-200 cursor-grab active:cursor-grabbing',
          isOpen && 'ring-2 ring-primary/40 bg-accent/60'
        )}
      >
        <div className="relative w-5 h-5 flex items-center justify-center">
          <Menu
            className={cn(
              'w-5 h-5 text-foreground transition-all duration-300 transform',
              isOpen ? 'rotate-90 scale-0 opacity-0 absolute' : 'rotate-0 scale-100 opacity-100'
            )}
          />
          <X
            className={cn(
              'w-5 h-5 text-foreground transition-all duration-300 transform',
              !isOpen ? '-rotate-90 scale-0 opacity-0 absolute' : 'rotate-0 scale-100 opacity-100'
            )}
          />
        </div>

        {/* Floating helper tooltip when navbar is closed */}
        {!isOpen && !isDragging && (
          <CustomTooltip text="Menu" isBottomSide={isBottomSide} />
        )}
      </button>

      {/* Extended Menu Bar */}
      <div
        className={cn(
          'flex items-center gap-1.5 p-1.5 rounded-full',
          'bg-background/85 dark:bg-zinc-900/85 backdrop-blur-xl border border-border/70 shadow-xl shadow-black/10 dark:shadow-black/40',
          'transition-all duration-300 ease-out origin-center overflow-visible',
          isOpen
            ? 'max-w-[420px] opacity-100 scale-100 pointer-events-auto'
            : 'max-w-0 opacity-0 scale-90 pointer-events-none p-0 border-transparent shadow-none overflow-hidden',
          isRightSide ? 'flex-row-reverse' : 'flex-row'
        )}
      >
        {/* Home Link */}
        <NavItem
          href="/"
          icon={<Home className="w-4 h-4" />}
          tooltip="Home"
          isActive={pathname === '/'}
          isBottomSide={isBottomSide}
        />

        {/* Deck List Link */}
        <NavItem
          href="/decks"
          icon={<BookOpen className="w-4 h-4" />}
          tooltip="Decks"
          isActive={pathname === '/decks'}
          isBottomSide={isBottomSide}
        />

        {isAuthenticated ? (
          <>
            {/* Settings Link */}
            <NavItem
              href="/settings"
              icon={<Settings className="w-4 h-4" />}
              tooltip="Settings"
              isActive={pathname === '/settings'}
              isBottomSide={isBottomSide}
            />

            {/* Profile Link */}
            <NavItem
              href={`/${user.username || 'profile'}`}
              icon={<User className="w-4 h-4" />}
              tooltip={user.username ? `@${user.username}` : 'Profile'}
              isActive={pathname === `/${user.username}`}
              isBottomSide={isBottomSide}
            />

            {/* Log Out Button */}
            <NavItem
              onClick={logout}
              icon={<LogOut className="w-4 h-4 text-destructive" />}
              tooltip="Log out"
              isBottomSide={isBottomSide}
            />
          </>
        ) : (
          /* Guest / Not Logged In Account Button & Hover Sub-menu */
          <div
            className="relative"
            onMouseEnter={() => setIsAccountHovered(true)}
            onMouseLeave={() => setIsAccountHovered(false)}
          >
            <div className={cn('flex items-center gap-1.5', isRightSide ? 'flex-row-reverse' : 'flex-row')}>
              {/* Main Account Button Icon */}
              <NavItem
                icon={<UserCircle className="w-4 h-4" />}
                tooltip="Account"
                isActive={pathname === '/login' || pathname === '/signup'}
                isBottomSide={isBottomSide}
              />

              {/* Extended Sign Up & Log In Sub-buttons on Hover */}
              <div
                className={cn(
                  'flex items-center gap-1.5 transition-all duration-300 ease-out overflow-hidden',
                  isRightSide ? 'flex-row-reverse' : 'flex-row',
                  isAccountHovered
                    ? 'max-w-[200px] opacity-100 scale-100 px-1'
                    : 'max-w-0 opacity-0 scale-90 px-0 pointer-events-none'
                )}
              >
                <NavItem
                  href="/login"
                  icon={<LogIn className="w-4 h-4" />}
                  tooltip="Log in"
                  isActive={pathname === '/login'}
                  isBottomSide={isBottomSide}
                />
                <NavItem
                  href="/signup"
                  icon={<UserPlus className="w-4 h-4 text-primary" />}
                  tooltip="Sign up"
                  isActive={pathname === '/signup'}
                  isBottomSide={isBottomSide}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
