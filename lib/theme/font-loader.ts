import { FontOption } from "@/types/theme"

export const AVAILABLE_FONTS: FontOption[] = [
  {
    id: "inter",
    name: "Inter",
    googleFontName: "Inter",
    category: "sans-serif",
  },
  {
    id: "onest",
    name: "Onest",
    googleFontName: "Onest",
    category: "sans-serif",
  },
  {
    id: "space-grotesk",
    name: "Space Grotesk",
    googleFontName: "Space+Grotesk",
    category: "display",
  },
  { id: "lora", name: "Lora", googleFontName: "Lora", category: "serif" },
]

const loadedFonts = new Set<string>()
let previewFontsLoaded = false

export function ensureFontPreconnect() {
  if (typeof window === "undefined") return

  if (!document.getElementById("google-fonts-preconnect-api")) {
    const link1 = document.createElement("link")
    link1.id = "google-fonts-preconnect-api"
    link1.rel = "preconnect"
    link1.href = "https://fonts.googleapis.com"
    document.head.appendChild(link1)
  }

  if (!document.getElementById("google-fonts-preconnect-static")) {
    const link2 = document.createElement("link")
    link2.id = "google-fonts-preconnect-static"
    link2.rel = "preconnect"
    link2.href = "https://fonts.gstatic.com"
    link2.crossOrigin = "anonymous"
    document.head.appendChild(link2)
  }
}

export function getFontFamilyFallback(
  category: FontOption["category"]
): string {
  switch (category) {
    case "serif":
      return "serif"
    case "monospace":
      return "monospace"
    case "display":
    case "sans-serif":
    default:
      return "sans-serif"
  }
}

export function getFontFamilyCss(font: FontOption): string {
  switch (font.id) {
    case "onest":
      return `var(--font-onest), '${font.name}', var(--font-inter), 'Inter', -apple-system, BlinkMacSystemFont, sans-serif`
    case "space-grotesk":
      return `var(--font-space-grotesk), '${font.name}', var(--font-inter), 'Inter', -apple-system, BlinkMacSystemFont, sans-serif`
    case "lora":
      return `var(--font-lora), '${font.name}', Georgia, 'Times New Roman', serif`
    case "inter":
    default:
      return `var(--font-inter), '${font.name}', -apple-system, BlinkMacSystemFont, sans-serif`
  }
}

export function loadGoogleFont(fontName: string) {
  if (typeof window === "undefined") return

  // Skip default system / standard fonts that don't need Google Fonts link
  if (!fontName || fontName.toLowerCase() === "inter") {
    return
  }

  const fontObj = AVAILABLE_FONTS.find(
    (f) =>
      f.name.toLowerCase() === fontName.toLowerCase() ||
      f.id === fontName.toLowerCase()
  )

  const googleName = fontObj
    ? fontObj.googleFontName
    : fontName.replace(/\s+/g, "+")

  if (loadedFonts.has(googleName)) return

  ensureFontPreconnect()

  const fontId = `google-font-${googleName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`
  if (document.getElementById(fontId)) {
    loadedFonts.add(googleName)
    return
  }

  const link = document.createElement("link")
  link.id = fontId
  link.rel = "stylesheet"
  link.href = `https://fonts.googleapis.com/css2?family=${googleName}:wght@300;400;500;600;700&display=swap`
  document.head.appendChild(link)
  loadedFonts.add(googleName)
}

/**
 * Loads all available preview fonts in a single optimized combined Google Fonts request.
 * Called lazily when the appearance settings popup opens to minimize network overhead.
 */
export function loadAllPreviewFonts() {
  if (typeof window === "undefined" || previewFontsLoaded) return

  ensureFontPreconnect()

  const previewTagId = "google-fonts-preview-all"
  if (document.getElementById(previewTagId)) {
    previewFontsLoaded = true
    return
  }

  // Combine non-inter fonts into a single Google Fonts stylesheet request with display=swap
  const fontFamilies = AVAILABLE_FONTS.filter((f) => f.id !== "inter")
    .map((f) => `family=${f.googleFontName}:wght@400;600`)
    .join("&")

  if (!fontFamilies) return

  const link = document.createElement("link")
  link.id = previewTagId
  link.rel = "stylesheet"
  link.href = `https://fonts.googleapis.com/css2?${fontFamilies}&display=swap`
  document.head.appendChild(link)
  previewFontsLoaded = true
}
