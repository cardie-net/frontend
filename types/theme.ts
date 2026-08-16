export type DeckDisplayMode = 'grid' | 'line';

export interface ThemeColors {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  border: string;
  input: string;
  ring: string;
  sidebarBackground?: string;
  sidebarForeground?: string;
  sidebarPrimary?: string;
  sidebarPrimaryForeground?: string;
  sidebarAccent?: string;
  sidebarAccentForeground?: string;
  sidebarBorder?: string;
  sidebarRing?: string;
}

export interface FontOption {
  id: string;
  name: string;
  googleFontName: string;
  category: 'sans-serif' | 'serif' | 'display' | 'monospace';
}

export interface ThemePreset {
  id: string;
  name?: string;
  description?: string;
  isLight?: boolean;
  radius: number; // in rem
  fontFamily: string; // FontOption id or googleFontName
  colors: ThemeColors;
}

export interface ThemeConfig {
  radius: number;
  fontFamily: string;
  colors: ThemeColors;
  deckDisplayMode?: DeckDisplayMode;
}

export interface CustomThemeContextType {
  config: ThemeConfig;
  mounted: boolean;
  deckDisplayMode: DeckDisplayMode;
  setDeckDisplayMode: (mode: DeckDisplayMode) => void;
  activePreset: ThemePreset | null;
  presets: ThemePreset[];
  availableFonts: FontOption[];
  applyPreset: (presetId: string) => void;
  setRadius: (radius: number) => void;
  setFontFamily: (fontName: string) => void;
  updateColor: (colorKey: keyof ThemeColors, value: string) => void;
  resetToDefault: () => void;
  exportThemeJson: () => string;
  importThemeJson: (jsonString: string) => boolean;
}

