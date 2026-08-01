'use client'

import { Button } from "@/components/ui/button"
import { setLocale } from "@/app/actions"
import { useRouter } from "next/navigation"

export function LanguageSwitcher() {
  const router = useRouter()

  const handleSetLocale = async (locale: string) => {
    await setLocale(locale)
    router.refresh()
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={() => handleSetLocale('en')}>English</Button>
      <Button variant="outline" onClick={() => handleSetLocale('es')}>Español</Button>
    </div>
  )
}
