"use client"

import { Button } from "@/components/ui/button"
import { setLocale } from "@/app/actions"
import { useRouter } from "next/navigation"
import { SUPPORTED_LOCALES, LOCALE_LABELS, Locale } from "@/i18n/config"
import { FlagIcon } from "@/components/FlagIcon"

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
          className="flex items-center gap-2"
        >
          <FlagIcon locale={locale} className="h-3.5 w-4.5" />
          <span>{LOCALE_LABELS[locale].nativeName}</span>
        </Button>
      ))}
    </div>
  )
}
