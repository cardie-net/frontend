import React from 'react';
import { THEME_STORAGE_KEY, STYLE_TAG_ID } from '@/lib/theme/theme-engine';
import { DEFAULT_PRESET } from '@/lib/theme/presets';

export function ThemeScript() {
  const code = `
(function() {
  try {
    var key = '${THEME_STORAGE_KEY}';
    var styleId = '${STYLE_TAG_ID}';
    var saved = localStorage.getItem(key);
    var config = null;
    if (saved) {
      config = JSON.parse(saved);
    }
    if (!config || !config.colors) {
      var defaultPreset = ${JSON.stringify(DEFAULT_PRESET)};
      config = {
        radius: defaultPreset.radius,
        fontFamily: defaultPreset.fontFamily,
        colors: defaultPreset.colors
      };
    }
    
    var colors = config.colors;
    var rawFont = (config.fontFamily || '').toLowerCase().replace(/\s+/g, '-');
    var fontVal = "var(--font-inter), 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    if (rawFont === 'onest') {
      fontVal = "var(--font-onest), 'Onest', var(--font-inter), 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    } else if (rawFont === 'space-grotesk') {
      fontVal = "var(--font-space-grotesk), 'Space Grotesk', var(--font-inter), 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    } else if (rawFont === 'lora') {
      fontVal = "var(--font-lora), 'Lora', Georgia, 'Times New Roman', serif";
    }
    
    var css = ':root, .dark { ' +
      'font-size: 16px; ' +
      '-webkit-text-size-adjust: 100%; ' +
      'text-size-adjust: 100%; ' +
      '--radius: ' + config.radius + 'rem; ' +
      '--font-sans: ' + fontVal + '; ' +
      '--font-heading: ' + fontVal + '; ' +
      '--background: ' + colors.background + '; ' +
      '--foreground: ' + colors.foreground + '; ' +
      '--card: ' + colors.card + '; ' +
      '--card-foreground: ' + colors.cardForeground + '; ' +
      '--popover: ' + colors.popover + '; ' +
      '--popover-foreground: ' + colors.popoverForeground + '; ' +
      '--primary: ' + colors.primary + '; ' +
      '--primary-foreground: ' + colors.primaryForeground + '; ' +
      '--secondary: ' + colors.secondary + '; ' +
      '--secondary-foreground: ' + colors.secondaryForeground + '; ' +
      '--muted: ' + colors.muted + '; ' +
      '--muted-foreground: ' + colors.mutedForeground + '; ' +
      '--accent: ' + colors.accent + '; ' +
      '--accent-foreground: ' + colors.accentForeground + '; ' +
      '--destructive: ' + colors.destructive + '; ' +
      '--border: ' + colors.border + '; ' +
      '--input: ' + colors.input + '; ' +
      '--ring: ' + colors.ring + '; ';
      
    if (colors.sidebarBackground) css += '--sidebar: ' + colors.sidebarBackground + '; ';
    if (colors.sidebarForeground) css += '--sidebar-foreground: ' + colors.sidebarForeground + '; ';
    if (colors.sidebarPrimary) css += '--sidebar-primary: ' + colors.sidebarPrimary + '; ';
    if (colors.sidebarPrimaryForeground) css += '--sidebar-primary-foreground: ' + colors.sidebarPrimaryForeground + '; ';
    if (colors.sidebarAccent) css += '--sidebar-accent: ' + colors.sidebarAccent + '; ';
    if (colors.sidebarAccentForeground) css += '--sidebar-accent-foreground: ' + colors.sidebarAccentForeground + '; ';
    if (colors.sidebarBorder) css += '--sidebar-border: ' + colors.sidebarBorder + '; ';
    if (colors.sidebarRing) css += '--sidebar-ring: ' + colors.sidebarRing + '; ';
    
    css += '}';

    var styleEl = document.createElement('style');
    styleEl.id = styleId;
    styleEl.textContent = css;
    document.head.appendChild(styleEl);

    var isLight = colors.background.indexOf('0.98') !== -1 || colors.background.indexOf('0.99') !== -1 || colors.background.indexOf('1 0 0') !== -1;
    if (isLight) {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  } catch (e) {
    console.error('Error applying theme script:', e);
  }
})();
  `;
  return <script dangerouslySetInnerHTML={{ __html: code }} suppressHydrationWarning />;
}
