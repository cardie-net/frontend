/** Supported app locales — keep in sync with the files in messages/. */
export const SUPPORTED_LOCALES = ["en", "uk"] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]
export const DEFAULT_LOCALE: Locale = "en"

export const LOCALE_LABELS: Record<
  Locale,
  { name: string; nativeName: string; flag: string }
> = {
  en: { name: "English", nativeName: "English", flag: "🇬🇧" },
  uk: { name: "Ukrainian", nativeName: "Українська", flag: "🇺🇦" },
}

export function isSupportedLocale(value: string): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale)
}

/**
 * Detect the user's preferred locale from an `Accept-Language` header value
 * (e.g. "uk-UA, uk;q=0.9, en;q=0.8"). Language tags are matched on their
 * primary subtag ("uk" matches "uk-UA"), weighted by q-values. Falls back to
 * DEFAULT_LOCALE when no supported language is listed.
 */
export function detectLocaleFromAcceptLanguage(
  acceptLanguage: string | null | undefined
): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE

  const languages = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";")
      let q = 1
      for (const param of params) {
        const match = param.trim().match(/^q=([0-9.]+)$/i)
        if (match) q = Number.parseFloat(match[1]) || 0
      }
      return { tag: tag.trim().toLowerCase(), q }
    })
    .sort((a, b) => b.q - a.q)

  for (const { tag } of languages) {
    const primarySubtag = tag.split("-")[0]
    if (isSupportedLocale(primarySubtag)) return primarySubtag
  }

  return DEFAULT_LOCALE
}
