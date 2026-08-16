/** Supported app locales — keep in sync with the files in messages/. */
export const SUPPORTED_LOCALES = ["en", "pt", "uk"] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]
export const DEFAULT_LOCALE: Locale = "en"

export const LOCALE_LABELS: Record<
  Locale,
  { name: string; nativeName: string; flag: string }
> = {
  en: { name: "English", nativeName: "English", flag: "🇬🇧" },
  pt: { name: "Portuguese", nativeName: "Português", flag: "🇵🇹" },
  uk: { name: "Ukrainian", nativeName: "Українська", flag: "🇺🇦" },
}

export function isSupportedLocale(value: string): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale)
}
