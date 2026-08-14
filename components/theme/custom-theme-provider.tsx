'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  ThemeConfig,
  ThemeColors,
  CustomThemeContextType,
} from '@/types/theme';
import { PRESET_THEMES, DEFAULT_PRESET } from '@/lib/theme/presets';
import { AVAILABLE_FONTS, loadGoogleFont } from '@/lib/theme/font-loader';
import {
  applyThemeToDom,
  getSavedThemeConfigFromStorage,
  saveThemeConfigToStorage,
} from '@/lib/theme/theme-engine';
import { apiFetch } from '@/lib/api';

const CustomThemeContext = createContext<CustomThemeContextType | undefined>(undefined);

export function CustomThemeProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<ThemeConfig>(() => {
    if (typeof window !== 'undefined') {
      const saved = getSavedThemeConfigFromStorage();
      if (saved) return saved;
    }
    return {
      radius: DEFAULT_PRESET.radius,
      fontFamily: DEFAULT_PRESET.fontFamily,
      colors: { ...DEFAULT_PRESET.colors },
    };
  });

  // Keep DOM styling & Google Fonts synchronized whenever config updates
  useEffect(() => {
    loadGoogleFont(config.fontFamily);
    applyThemeToDom(config);
  }, [config]);

  const activePreset = PRESET_THEMES.find(
    (p) => JSON.stringify(p.colors) === JSON.stringify(config.colors)
  ) || null;

  const updateConfig = (newConfig: ThemeConfig) => {
    setConfig(newConfig);
    saveThemeConfigToStorage(newConfig);
    
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

  const applyPreset = (presetId: string) => {
    const target = PRESET_THEMES.find((p) => p.id === presetId);
    if (!target) return;

    const newConfig: ThemeConfig = {
      radius: config.radius,
      fontFamily: config.fontFamily,
      colors: { ...target.colors },
    };

    updateConfig(newConfig);
  };

  const setRadius = (radius: number) => {
    const newConfig: ThemeConfig = {
      ...config,
      radius,
    };
    updateConfig(newConfig);
  };

  const setFontFamily = (fontFamily: string) => {
    const newConfig: ThemeConfig = {
      ...config,
      fontFamily,
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
    };
    updateConfig(newConfig);
  };

  const resetToDefault = () => {
    const newConfig: ThemeConfig = {
      radius: DEFAULT_PRESET.radius,
      fontFamily: DEFAULT_PRESET.fontFamily,
      colors: { ...DEFAULT_PRESET.colors },
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
      updateConfig(parsed);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <CustomThemeContext.Provider
      value={{
        config,
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
