"use client"

import { useTranslations } from "next-intl"

export default function AuthDivider({ label }: { label?: string }) {
  const t = useTranslations("Common")
  const displayLabel = label ?? t("or")

  return (
    <div className="my-6 flex items-center gap-3">
      <div className="h-px flex-1 bg-border" />
      <span className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
        {displayLabel}
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  )
}
