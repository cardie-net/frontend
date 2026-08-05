'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { cn } from '@/lib/utils';
import { useLocale } from 'next-intl';
import { setLocale } from '@/app/actions';
import { SUPPORTED_LOCALES, LOCALE_LABELS, Locale } from '@/i18n/config';
import {
  Menu,
  X,
  Layers,
  Settings,
  User,
  LogIn,
  UserPlus,
  LogOut,
  Palette,
  Languages,
  BarChart3,
} from 'lucide-react';
import { AppearancePopup } from '@/components/theme/appearance-popup';

type CornerPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

interface CustomTooltipProps {
  text: string;
  isRightSide: boolean;
}

function CustomTooltip({ text, isRightSide }: CustomTooltipProps) {
  return (
    <div
      className={cn(
        'absolute top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-medium rounded-lg shadow-xl whitespace-nowrap pointer-events-none transition-all duration-200 z-50',
        'bg-popover/90 text-popover-foreground border border-border/50 shadow-md backdrop-blur-md',
        'opacity-0 group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 scale-95 origin-center',
        isRightSide ? 'right-full mr-3' : 'left-full ml-3'
      )}
    >
      {text}
      <div
        className={cn(
          'absolute top-1/2 -translate-y-1/2 border-4 border-transparent',
          isRightSide
            ? 'left-full border-l-popover/90'
            : 'right-full border-r-popover/90'
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
  isRightSide: boolean;
  className?: string;
}

function NavItem({
  href,
  onClick,
  icon,
  tooltip,
  isActive = false,
  isRightSide,
  className,
}: NavItemProps) {
  const content = (
    <div
      className={cn(
        'relative group/tooltip flex items-center justify-center w-9 h-9 rounded-[var(--radius)] transition-all duration-200',
        isActive
          ? 'bg-primary text-primary-foreground shadow-md scale-105'
          : 'text-muted-foreground hover:text-foreground hover:bg-accent/80 hover:scale-105 active:scale-95',
        className
      )}
    >
      {icon}
      <CustomTooltip text={tooltip} isRightSide={isRightSide} />
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

interface LanguageNavItemProps {
  currentLocale: string;
  isRightSide: boolean;
  onSelectLocale: (locale: Locale) => void;
}

function LanguageNavItem({
  currentLocale,
  isRightSide,
  onSelectLocale,
}: LanguageNavItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent | TouchEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('pointerdown', handleClickOutside);
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative flex items-center"
    >
      {/* Language Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        className="focus:outline-none"
        aria-label="Select language"
      >
        <div
          className={cn(
            'relative group/tooltip flex items-center justify-center w-9 h-9 rounded-[var(--radius)] transition-all duration-200',
            isOpen
              ? 'bg-primary text-primary-foreground shadow-md scale-105'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/80 hover:scale-105 active:scale-95'
          )}
        >
          <Languages className="w-4 h-4" />
          {!isOpen && (
            <CustomTooltip
              text={`Language (${currentLocale.toUpperCase()})`}
              isRightSide={isRightSide}
            />
          )}
        </div>
      </button>

      {/* Flyout Language Selection Bar extending to the side, with languages stacked vertically above each other */}
      <div
        className={cn(
          'absolute top-1/2 -translate-y-1/2 flex flex-col gap-1 p-1.5 rounded-2xl min-w-[140px]',
          'bg-background/95 backdrop-blur-xl border border-border/80 shadow-2xl shadow-black/20 z-50',
          'transition-all duration-300 ease-out origin-center',
          isRightSide ? 'right-full mr-2.5' : 'left-full ml-2.5',
          isOpen
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-95 pointer-events-none p-0 border-transparent shadow-none overflow-hidden h-0 w-0'
        )}
      >
        {SUPPORTED_LOCALES.map((loc) => {
          const info = LOCALE_LABELS[loc];
          const isSelected = currentLocale === loc;

          return (
            <button
              key={loc}
              type="button"
              onClick={() => {
                onSelectLocale(loc);
                setIsOpen(false);
              }}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 whitespace-nowrap select-none cursor-pointer w-full text-left',
                isSelected
                  ? 'bg-primary text-primary-foreground shadow-sm font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/80 active:scale-95'
              )}
            >
              <span className="text-sm leading-none">{info.flag}</span>
              <span>{info.nativeName}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface AppearanceNavItemProps {
  isRightSide: boolean;
}

function AppearanceNavItem({ isRightSide }: AppearanceNavItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative flex items-center">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="focus:outline-none"
        aria-label="Appearance"
      >
        <div
          className={cn(
            'relative group/tooltip flex items-center justify-center w-9 h-9 rounded-[var(--radius)] transition-all duration-200',
            isOpen
              ? 'bg-primary text-primary-foreground shadow-md scale-105'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/80 hover:scale-105 active:scale-95'
          )}
        >
          <Palette className="w-4 h-4" />
          {!isOpen && (
            <CustomTooltip text="Appearance" isRightSide={isRightSide} />
          )}
        </div>
      </button>

      <AppearancePopup
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
}

export function Navbar() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = useLocale();

  const [corner, setCorner] = useState<CornerPosition>('top-right');
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const startPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const offsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const movedFarRef = useRef(false);

  // Switch to selected locale
  const handleSelectLocale = async (newLocale: Locale) => {
    await setLocale(newLocale);
    router.refresh();
  };

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
      }
    }

    document.addEventListener('pointerdown', handleClickOutside);
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
    };
  }, [isOpen]);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

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
  const hasPfp = Boolean(user && !user.is_guest && user.avatar_url);

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
        isBottomSide ? 'flex-col-reverse' : 'flex-col'
      )}
    >
      {/* Circle Menu Handle */}
      <button
        type="button"
        onPointerDown={handlePointerDown}
        aria-label="Toggle menu"
        className={cn(
          'group relative w-12 h-12 rounded-[calc(var(--radius)+0.25rem)] flex items-center justify-center overflow-hidden',
          'bg-background/85 backdrop-blur-xl border border-border/70 shadow-lg shadow-black/10',
          'hover:scale-105 active:scale-95 transition-all duration-200 cursor-grab active:cursor-grabbing',
          isOpen && 'ring-2 ring-primary/40 bg-accent/60'
        )}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {hasPfp ? (
            <img
              src={user!.avatar_url}
              alt={user!.display_name || user!.username || 'Avatar'}
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
              className={cn(
                'w-full h-full rounded-[var(--radius)] object-cover transition-all duration-300 transform pointer-events-none select-none',
                isOpen ? 'rotate-90 scale-0 opacity-0 absolute' : 'rotate-0 scale-100 opacity-100'
              )}
            />
          ) : (
            <Menu
              className={cn(
                'w-5 h-5 text-foreground transition-all duration-300 transform',
                isOpen ? 'rotate-90 scale-0 opacity-0 absolute' : 'rotate-0 scale-100 opacity-100'
              )}
            />
          )}
          <X
            className={cn(
              'w-5 h-5 text-foreground transition-all duration-300 transform',
              !isOpen ? '-rotate-90 scale-0 opacity-0 absolute' : 'rotate-0 scale-100 opacity-100'
            )}
          />
        </div>

        {/* Floating helper tooltip when navbar is closed */}
        {!isOpen && !isDragging && (
          <CustomTooltip text="Menu" isRightSide={isRightSide} />
        )}
      </button>

      {/* Extended Menu Bar */}
      <div
        className={cn(
          'flex flex-col items-center gap-1.5 p-1.5 rounded-[calc(var(--radius)+0.375rem)]',
          'bg-background/85 backdrop-blur-xl border border-border/70 shadow-xl shadow-black/10',
          'transition-all duration-300 ease-out origin-center overflow-visible',
          isOpen
            ? 'max-h-[500px] opacity-100 scale-100 pointer-events-auto'
            : 'max-h-0 opacity-0 scale-90 pointer-events-none p-0 border-transparent shadow-none overflow-hidden',
          isBottomSide ? 'flex-col-reverse' : 'flex-col'
        )}
      >
        {/* Deck List Link */}
        <NavItem
          href="/decks"
          icon={<Layers className="w-4 h-4" />}
          tooltip="Decks"
          isActive={pathname === '/decks'}
          isRightSide={isRightSide}
        />

        {/* Language Selection Flyout NavItem */}
        <LanguageNavItem
          currentLocale={currentLocale}
          isRightSide={isRightSide}
          onSelectLocale={handleSelectLocale}
        />

        {/* Appearance Selection Popup NavItem */}
        <AppearanceNavItem
          isRightSide={isRightSide}
        />

        {isAuthenticated ? (
          <>
            {/* Statistics Button (Logged-in users with actual accounts only) */}
            <NavItem
              href="/stats"
              icon={<BarChart3 className="w-4 h-4" />}
              tooltip="Statistics"
              isActive={pathname === '/stats' || pathname === '/statistics'}
              isRightSide={isRightSide}
            />

            {/* Settings Link */}
            <NavItem
              href="/settings"
              icon={<Settings className="w-4 h-4" />}
              tooltip="Settings"
              isActive={pathname === '/settings'}
              isRightSide={isRightSide}
            />

            {/* Profile Link */}
            <NavItem
              href={`/${user.username || 'profile'}`}
              icon={<User className="w-4 h-4" />}
              tooltip={user.username ? `@${user.username}` : 'Profile'}
              isActive={pathname === `/${user.username}`}
              isRightSide={isRightSide}
            />

            {/* Log Out Button */}
            <NavItem
              onClick={logout}
              icon={<LogOut className="w-4 h-4 text-destructive" />}
              tooltip="Log out"
              isRightSide={isRightSide}
            />
          </>
        ) : (
          <>
            {/* Log In Link */}
            <NavItem
              href="/login"
              icon={<LogIn className="w-4 h-4" />}
              tooltip="Log in"
              isActive={pathname === '/login'}
              isRightSide={isRightSide}
            />

            {/* Sign Up Link */}
            <NavItem
              href="/signup"
              icon={<UserPlus className="w-4 h-4 text-primary" />}
              tooltip="Sign up"
              isActive={pathname === '/signup'}
              isRightSide={isRightSide}
            />
          </>
        )}
      </div>
    </div>
  );
}
