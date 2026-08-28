import { getRequestConfig } from "next-intl/server"
import { cookies, headers } from "next/headers"
import { detectLocaleFromAcceptLanguage, isSupportedLocale } from "./config"

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const rawLocale = cookieStore.get("NEXT_LOCALE")?.value
  // An explicitly chosen locale (set by the language switcher) wins; otherwise
  // fall back to the browser's preferred language, defaulting to English.
  const locale =
    rawLocale && isSupportedLocale(rawLocale)
      ? rawLocale
      : detectLocaleFromAcceptLanguage((await headers()).get("accept-language"))

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
