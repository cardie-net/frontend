import { ThemeConfig } from '@/types/theme';

export const FAVICON_LINK_ID = 'cardie-dynamic-favicon';

/**
 * Calculates the corner radius in pixels for the 32x32 favicon box
 * based on the theme's radius in rem. Matches the proportional rounded look:
 * - 0rem -> 0px (sharp square)
 * - 0.375rem (6px) -> 7.2px
 * - 0.625rem (10px, default) -> 12px (rounded square)
 * - >= 0.875rem (14px/20px) -> 16px (full circle)
 */
export function calculateFaviconRadius(radiusRem?: number): number {
  const rem = typeof radiusRem === 'number' ? radiusRem : 0.625;
  const rx = rem * 16 * 1.2;
  return Math.max(0, Math.min(16, Math.round(rx * 10) / 10));
}

/**
 * Generates an SVG string matching the deck icon on the "My Decks" page:
 * - Edge-to-edge 32x32 container
 * - Tight padding with prominent 24x24 Lucide Layers icon
 * - Rounded rectangle background with primary color
 * - Lucide Layers icon with primary stroke color
 */
export function generateFaviconSvg(config?: {
  radius?: number;
  colors?: { primary?: string };
}): string {
  const radiusRem = config?.radius ?? 0.625;
  const primary = config?.colors?.primary ?? 'oklch(0.65 0.24 295)';
  const rx = calculateFaviconRadius(radiusRem);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <rect width="32" height="32" rx="${rx}" ry="${rx}" fill="${primary}" fill-opacity="0.16"/>
  <g transform="translate(4, 4)" fill="none" stroke="${primary}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/>
    <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/>
    <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>
  </g>
</svg>`;
}

/**
 * Returns a URL-encoded SVG data URI suitable for <link rel="icon" href="...">.
 */
export function generateFaviconDataUri(config?: {
  radius?: number;
  colors?: { primary?: string };
}): string {
  const svg = generateFaviconSvg(config);
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * Updates or creates the dynamic favicon link element in document.head.
 */
export function updateFavicon(config: ThemeConfig) {
  if (typeof window === 'undefined') return;

  const dataUri = generateFaviconDataUri(config);
  const existingIcons = Array.from(document.querySelectorAll<HTMLLinkElement>("link[rel*='icon']"));

  if (existingIcons.length === 0) {
    const link = document.createElement('link');
    link.id = FAVICON_LINK_ID;
    link.rel = 'icon';
    link.type = 'image/svg+xml';
    link.href = dataUri;
    document.head.appendChild(link);
  } else {
    existingIcons.forEach((link) => {
      link.type = 'image/svg+xml';
      link.href = dataUri;
    });
  }
}
