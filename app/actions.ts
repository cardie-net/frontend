"use server"

import { cookies } from "next/headers"
import { isSupportedLocale } from "@/i18n/config"

export async function setLocale(locale: string) {
  if (!isSupportedLocale(locale)) return
  const cookieStore = await cookies()
  cookieStore.set("NEXT_LOCALE", locale, { path: "/" })
}
