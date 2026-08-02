/** Supported app locales — keep in sync with the files in messages/. */
export const SUPPORTED_LOCALES = ["en", "es"] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]
export const DEFAULT_LOCALE: Locale = "en"

export function isSupportedLocale(value: string): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale)
}
