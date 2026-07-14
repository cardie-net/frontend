'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun, Palette } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const content = (isDark: boolean) => (
    <>
      <div className="flex w-full flex-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (mounted) {
              setTheme(isDark ? 'light' : 'dark');
            }
          }}
          className="flex-1 flex items-center justify-center pt-3 pb-1 hover:bg-foreground/5 transition-colors border-r border-ac-btn-border outline-none focus:bg-foreground/5"
          aria-label="Toggle Dark/Light Mode"
        >
          {isDark ? <Sun size={24} /> : <Moon size={24} />}
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            // to be implemented later
          }}
          className="flex-1 flex items-center justify-center pt-3 pb-1 hover:bg-foreground/5 transition-colors outline-none focus:bg-foreground/5"
          aria-label="Change Theme"
        >
          <Palette size={24} />
        </button>
      </div>
      <div className="w-full text-center pb-3 pt-1 text-sm font-bold pointer-events-none">
        Theme
      </div>
    </>
  );

  const containerClass =
    'flex flex-col items-center justify-center rounded-lg bg-ac-btn-bg text-ac-btn-text transition-all border border-ac-btn-border shadow-[1px_1px_0px_var(--ac-btn-border)] hover:-translate-y-px hover:shadow-[2px_2px_0px_var(--ac-btn-border)] active:translate-y-px active:shadow-none overflow-hidden h-full';

  if (!mounted) {
    return <div className={`${containerClass} opacity-50`}>{content(false)}</div>;
  }

  const isDark = resolvedTheme === 'dark';

  return <div className={containerClass}>{content(isDark)}</div>;
}
