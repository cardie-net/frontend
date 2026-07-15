'use client';

import { Palette } from 'lucide-react';
import { AccountPopupButton } from './AccountPopupButton';
import { Popup } from './Popup';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

const THEMES = [
  { id: 'default', name: 'Default' },
  { id: 'purple-pink', name: 'Purple & Pink' },
  { id: 'black-white', name: 'Black & White' },
  { id: 'pink-white', name: 'Pink & White' },
];

export function ThemeToggle() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <AccountPopupButton icon={Palette} onClick={() => setIsPopupOpen(true)}>
        Theme
      </AccountPopupButton>

      <Popup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        title="Select Theme"
        backdropClassName="rounded-xl"
      >
        <div className="flex flex-col space-y-3">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTheme(t.id);
                setIsPopupOpen(false);
              }}
              className={`flex items-center justify-between w-full p-3 rounded-lg border-2 transition-all ${
                mounted && theme === t.id
                  ? 'border-foreground bg-foreground/10 shadow-[2px_2px_0px_currentColor]'
                  : 'border-border-heavy hover:bg-foreground/5 hover:border-foreground shadow-[1px_1px_0px_currentColor] hover:shadow-[2px_2px_0px_currentColor]'
              }`}
            >
              <span className="font-bold">{t.name}</span>
              {mounted && theme === t.id && <span className="w-3 h-3 rounded-full bg-foreground" />}
            </button>
          ))}
        </div>
      </Popup>
    </>
  );
}
