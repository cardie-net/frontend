"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"

export function GuestWarningCard() {
  const t = useTranslations("Decks.guestWarning")

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs leading-relaxed text-amber-900 shadow-xs sm:text-sm dark:border-amber-500/20 dark:bg-amber-950/20 dark:text-amber-200">
      <p>
        {t.rich("warning", {
          link: (chunks) => (
            <Link
              href="/signup"
              className="font-semibold text-amber-950 underline underline-offset-4 transition-opacity hover:opacity-80 dark:text-amber-100"
            >
              {chunks}
            </Link>
          ),
        })}
      </p>
    </div>
  )
}
