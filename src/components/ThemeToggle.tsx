'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AccountPopupButton } from './AccountPopupButton';

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <AccountPopupButton icon={Sun} className="opacity-50" asDiv>
        Theme
      </AccountPopupButton>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <AccountPopupButton
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      icon={isDark ? Sun : Moon}
    >
      {isDark ? 'Light Mode' : 'Dark Mode'}
    </AccountPopupButton>
  );
}
