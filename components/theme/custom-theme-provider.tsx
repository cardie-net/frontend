'use client';

import React, { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from 'react';
import {
  ThemeConfig,
  ThemeColors,
  DeckDisplayMode,
  CustomThemeContextType,
} from '@/types/theme';
import { PRESET_THEMES, DEFAULT_PRESET } from '@/lib/theme/presets';
import { AVAILABLE_FONTS, loadGoogleFont } from '@/lib/theme/font-loader';
import {
  applyThemeToDom,
  saveThemeConfigToStorage,
  THEME_STORAGE_KEY,
} from '@/lib/theme/theme-engine';
import { apiFetch } from '@/lib/api';

const THEME_CHANGE_EVENT = 'cardie_theme_change';

function subscribeTheme(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener(THEME_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(THEME_CHANGE_EVENT, callback);
  };
}

function getThemeSnapshot(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(THEME_STORAGE_KEY) || '';
}

function getServerThemeSnapshot(): string {
  return '';
}

const CustomThemeContext = createContext<CustomThemeContextType | undefined>(undefined);

export function CustomThemeProvider({ children }: { children: React.ReactNode }) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const savedJson = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerThemeSnapshot
  );

  const config = useMemo<ThemeConfig>(() => {
    if (savedJson) {
      try {
        const parsed = JSON.parse(savedJson) as ThemeConfig;
        if (parsed.colors && typeof parsed.radius === 'number' && parsed.fontFamily) {
          const isFontValid = AVAILABLE_FONTS.some(
            (f) => f.name.toLowerCase() === parsed.fontFamily.toLowerCase() || f.id === parsed.fontFamily.toLowerCase()
          );
          return {
            ...parsed,
            fontFamily: isFontValid ? parsed.fontFamily : DEFAULT_PRESET.fontFamily,
            deckDisplayMode: parsed.deckDisplayMode || 'grid',
          };
        }
      } catch {
        // Fallback to default on parse error
      }
    }
    return {
      radius: DEFAULT_PRESET.radius,
      fontFamily: DEFAULT_PRESET.fontFamily,
      colors: { ...DEFAULT_PRESET.colors },
      deckDisplayMode: 'grid',
    };
  }, [savedJson]);

  // Keep DOM styling & Google Fonts synchronized whenever config updates
  useEffect(() => {
    loadGoogleFont(config.fontFamily);
    applyThemeToDom(config);
  }, [config]);

  const activePreset = PRESET_THEMES.find(
    (p) => JSON.stringify(p.colors) === JSON.stringify(config.colors)
  ) || null;

  const updateConfig = (newConfig: ThemeConfig) => {
    saveThemeConfigToStorage(newConfig);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
    }
    
    // Send request immediately so if user reloads, it's saved
    apiFetch('/api/v1/users/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preferences: { themeConfig: newConfig } }),
      keepalive: true,
    }).catch(() => {
      // Ignore errors (e.g. if user is not logged in)
    });
  };

  const setDeckDisplayMode = (deckDisplayMode: DeckDisplayMode) => {
    const newConfig: ThemeConfig = {
      ...config,
      deckDisplayMode,
    };
    updateConfig(newConfig);
  };

  const applyPreset = (presetId: string) => {
    const target = PRESET_THEMES.find((p) => p.id === presetId);
    if (!target) return;

    const newConfig: ThemeConfig = {
      radius: config.radius,
      fontFamily: config.fontFamily,
      colors: { ...target.colors },
      deckDisplayMode: config.deckDisplayMode || 'grid',
    };

    updateConfig(newConfig);
  };

  const setRadius = (radius: number) => {
    const newConfig: ThemeConfig = {
      ...config,
      radius,
      deckDisplayMode: config.deckDisplayMode || 'grid',
    };
    updateConfig(newConfig);
  };

  const setFontFamily = (fontFamily: string) => {
    const newConfig: ThemeConfig = {
      ...config,
      fontFamily,
      deckDisplayMode: config.deckDisplayMode || 'grid',
    };
    updateConfig(newConfig);
  };

  const updateColor = (colorKey: keyof ThemeColors, value: string) => {
    const newColors: ThemeColors = {
      ...config.colors,
      [colorKey]: value,
    };

    const newConfig: ThemeConfig = {
      ...config,
      colors: newColors,
      deckDisplayMode: config.deckDisplayMode || 'grid',
    };
    updateConfig(newConfig);
  };

  const resetToDefault = () => {
    const newConfig: ThemeConfig = {
      radius: DEFAULT_PRESET.radius,
      fontFamily: DEFAULT_PRESET.fontFamily,
      colors: { ...DEFAULT_PRESET.colors },
      deckDisplayMode: 'grid',
    };
    updateConfig(newConfig);
  };

  const exportThemeJson = (): string => {
    return JSON.stringify(config, null, 2);
  };

  const importThemeJson = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString) as ThemeConfig;
      if (!parsed.colors || typeof parsed.radius !== 'number' || !parsed.fontFamily) {
        return false;
      }
      const isFontValid = AVAILABLE_FONTS.some(
        (f) => f.name.toLowerCase() === parsed.fontFamily.toLowerCase() || f.id === parsed.fontFamily.toLowerCase()
      );
      const newConfig: ThemeConfig = {
        ...parsed,
        fontFamily: isFontValid ? parsed.fontFamily : DEFAULT_PRESET.fontFamily,
        deckDisplayMode: parsed.deckDisplayMode || 'grid',
      };
      updateConfig(newConfig);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <CustomThemeContext.Provider
      value={{
        config,
        mounted,
        deckDisplayMode: config.deckDisplayMode || 'grid',
        setDeckDisplayMode,
        activePreset,
        presets: PRESET_THEMES,
        availableFonts: AVAILABLE_FONTS,
        applyPreset,
        setRadius,
        setFontFamily,
        updateColor,
        resetToDefault,
        exportThemeJson,
        importThemeJson,
      }}
    >
      {children}
    </CustomThemeContext.Provider>
  );
}

export function useCustomTheme() {
  const context = useContext(CustomThemeContext);
  if (!context) {
    throw new Error('useCustomTheme must be used within a CustomThemeProvider');
  }
  return context;
}
