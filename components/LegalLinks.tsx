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
        "flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-x-6 sm:gap-y-0 pt-4 pb-2 text-xs text-muted-foreground",
        className
      )}
    >
      <Link
        href="/terms-of-service"
        className="transition-colors hover:text-foreground hover:underline underline-offset-4 text-center"
      >
        {t("termsOfService")}
      </Link>
      <span className="hidden sm:inline text-border select-none">•</span>
      <Link
        href="/privacy-policy"
        className="transition-colors hover:text-foreground hover:underline underline-offset-4 text-center"
      >
        {t("privacyPolicy")}
      </Link>
    </footer>
  )
}

export { LegalLinks as LegalFooter }
