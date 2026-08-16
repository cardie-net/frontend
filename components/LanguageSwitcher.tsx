'use client'

import { Button } from "@/components/ui/button"
import { setLocale } from "@/app/actions"
import { useRouter } from "next/navigation"
import { SUPPORTED_LOCALES, LOCALE_LABELS, Locale } from "@/i18n/config"

export function LanguageSwitcher() {
  const router = useRouter()

  const handleSetLocale = async (locale: Locale) => {
    await setLocale(locale)
    router.refresh()
  }

  return (
    <div className="flex gap-2">
      {SUPPORTED_LOCALES.map((locale) => (
        <Button
          key={locale}
          variant="outline"
          onClick={() => handleSetLocale(locale)}
        >
          {LOCALE_LABELS[locale].nativeName}
        </Button>
      ))}
    </div>
  )
}
