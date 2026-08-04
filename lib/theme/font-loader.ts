import { FontOption } from '@/types/theme';

export const AVAILABLE_FONTS: FontOption[] = [
  { id: 'inter', name: 'Inter', googleFontName: 'Inter', category: 'sans-serif' },
  { id: 'plus-jakarta-sans', name: 'Plus Jakarta Sans', googleFontName: 'Plus+Jakarta+Sans', category: 'sans-serif' },
  { id: 'outfit', name: 'Outfit', googleFontName: 'Outfit', category: 'sans-serif' },
  { id: 'geist', name: 'Geist', googleFontName: 'Geist', category: 'sans-serif' },
  { id: 'poppins', name: 'Poppins', googleFontName: 'Poppins', category: 'sans-serif' },
  { id: 'roboto', name: 'Roboto', googleFontName: 'Roboto', category: 'sans-serif' },
  { id: 'space-grotesk', name: 'Space Grotesk', googleFontName: 'Space+Grotesk', category: 'display' },
  { id: 'lora', name: 'Lora', googleFontName: 'Lora', category: 'serif' },
];

const loadedFonts = new Set<string>();

export function loadGoogleFont(fontName: string) {
  if (typeof window === 'undefined') return;
  
  // Skip default system / standard fonts that don't need Google Fonts link
  if (!fontName || fontName.toLowerCase() === 'inter' || fontName.toLowerCase() === 'geist') {
    return;
  }

  const fontObj = AVAILABLE_FONTS.find(
    (f) => f.name.toLowerCase() === fontName.toLowerCase() || f.id === fontName.toLowerCase()
  );

  const googleName = fontObj ? fontObj.googleFontName : fontName.replace(/\s+/g, '+');
  
  if (loadedFonts.has(googleName)) return;

  const fontId = `google-font-${googleName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  if (document.getElementById(fontId)) {
    loadedFonts.add(googleName);
    return;
  }

  const link = document.createElement('link');
  link.id = fontId;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${googleName}:wght@300;400;500;600;700&display=swap`;
  document.head.appendChild(link);
  loadedFonts.add(googleName);
}
