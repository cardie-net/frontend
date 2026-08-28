"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

interface LegalLinksProps {
  className?: string
}

export function LegalLinks({ className }: LegalLinksProps) {
  const t = useTranslations("Legal")

  return (
    <footer
      className={cn(
        "flex flex-col items-center justify-center gap-2 pt-4 pb-2 text-xs text-muted-foreground sm:flex-row sm:gap-x-6 sm:gap-y-0",
        className
      )}
    >
      <Link
        href="/terms-of-service"
        className="text-center underline-offset-4 transition-colors hover:text-foreground hover:underline"
      >
        {t("termsOfService")}
      </Link>
      <span className="hidden text-border select-none sm:inline">•</span>
      <Link
        href="/privacy-policy"
        className="text-center underline-offset-4 transition-colors hover:text-foreground hover:underline"
      >
        {t("privacyPolicy")}
      </Link>
    </footer>
  )
}

export { LegalLinks as LegalFooter }
