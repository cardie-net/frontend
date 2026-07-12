'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg border-2 border-foreground opacity-50">
        <div className="w-[24px] h-[24px]" />
        <span className="text-sm font-bold">Theme</span>
      </div>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg border-2 border-foreground hover:bg-foreground/5 transition-colors"
      aria-label="Toggle theme"
    >
      {isDark ? <Sun size={24} /> : <Moon size={24} />}
      <span className="text-sm font-bold">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
    </button>
  );
}
