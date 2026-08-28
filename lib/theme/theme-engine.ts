import { ThemeConfig } from "@/types/theme"
import { updateFavicon } from "@/lib/theme/favicon"

export * from "@/lib/theme/favicon"
export const THEME_STORAGE_KEY = "cardie_custom_theme_config"
export const STYLE_TAG_ID = "cardie-custom-theme-vars"

export function getFontFamilyCssValue(fontFamily: string): string {
  const normalized = (fontFamily || "").toLowerCase().replace(/\s+/g, "-")
  switch (normalized) {
    case "onest":
      return `var(--font-onest), 'Onest', var(--font-inter), 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
    case "space-grotesk":
      return `var(--font-space-grotesk), 'Space Grotesk', var(--font-inter), 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
    case "lora":
      return `var(--font-lora), 'Lora', Georgia, 'Times New Roman', serif`
    case "inter":
    default:
      return `var(--font-inter), 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
  }
}

export function generateCssVariablesString(config: ThemeConfig): string {
  const { radius, fontFamily, colors } = config

  const fontValue = getFontFamilyCssValue(fontFamily)

  const vars: string[] = [
    `--radius: ${radius}rem;`,
    `--font-sans: ${fontValue};`,
    `--font-heading: ${fontValue};`,
    `--background: ${colors.background};`,
    `--foreground: ${colors.foreground};`,
    `--card: ${colors.card};`,
    `--card-foreground: ${colors.cardForeground};`,
    `--popover: ${colors.popover};`,
    `--popover-foreground: ${colors.popoverForeground};`,
    `--primary: ${colors.primary};`,
    `--primary-foreground: ${colors.primaryForeground};`,
    `--secondary: ${colors.secondary};`,
    `--secondary-foreground: ${colors.secondaryForeground};`,
    `--muted: ${colors.muted};`,
    `--muted-foreground: ${colors.mutedForeground};`,
    `--accent: ${colors.accent};`,
    `--accent-foreground: ${colors.accentForeground};`,
    `--destructive: ${colors.destructive};`,
    `--border: ${colors.border};`,
    `--input: ${colors.input};`,
    `--ring: ${colors.ring};`,
  ]

  if (colors.sidebarBackground)
    vars.push(`--sidebar: ${colors.sidebarBackground};`)
  if (colors.sidebarForeground)
    vars.push(`--sidebar-foreground: ${colors.sidebarForeground};`)
  if (colors.sidebarPrimary)
    vars.push(`--sidebar-primary: ${colors.sidebarPrimary};`)
  if (colors.sidebarPrimaryForeground)
    vars.push(
      `--sidebar-primary-foreground: ${colors.sidebarPrimaryForeground};`
    )
  if (colors.sidebarAccent)
    vars.push(`--sidebar-accent: ${colors.sidebarAccent};`)
  if (colors.sidebarAccentForeground)
    vars.push(`--sidebar-accent-foreground: ${colors.sidebarAccentForeground};`)
  if (colors.sidebarBorder)
    vars.push(`--sidebar-border: ${colors.sidebarBorder};`)
  if (colors.sidebarRing) vars.push(`--sidebar-ring: ${colors.sidebarRing};`)

  const varsBlock = vars.join("\n  ")

  return `
:root, .dark {
  font-size: 16px;
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
  ${varsBlock}
}
`
}

export function applyThemeToDom(config: ThemeConfig) {
  if (typeof window === "undefined") return

  const cssString = generateCssVariablesString(config)

  let styleTag = document.getElementById(
    STYLE_TAG_ID
  ) as HTMLStyleElement | null
  if (!styleTag) {
    styleTag = document.createElement("style")
    styleTag.id = STYLE_TAG_ID
    document.head.appendChild(styleTag)
  }
  styleTag.textContent = cssString

  // Set class on <html>: if preset is explicit light, remove dark; otherwise always force .dark
  const root = document.documentElement
  // We check if colors indicate light mode or explicit flag
  const isLight =
    config.colors.background.includes("0.98") ||
    config.colors.background.includes("0.99") ||
    config.colors.background.includes("1 0 0")

  if (isLight) {
    root.classList.remove("dark")
    root.classList.add("light")
  } else {
    root.classList.remove("light")
    root.classList.add("dark")
  }

  updateFavicon(config)
}

export function saveThemeConfigToStorage(config: ThemeConfig) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(config))
  } catch (err) {
    console.error("Failed to save theme to localStorage:", err)
  }
}

export function getSavedThemeConfigFromStorage(): ThemeConfig | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as ThemeConfig
  } catch (err) {
    console.error("Failed to parse saved theme from localStorage:", err)
    return null
  }
}
