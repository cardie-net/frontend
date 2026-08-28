"use client"

import { useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { ScrollText, ShieldCheck, Scale } from "lucide-react"
import { Card } from "@/components/ui/card"
import { LegalMarkdown } from "@/components/LegalMarkdown"
import { SUPPORTED_LOCALES, LOCALE_LABELS, type Locale } from "@/i18n/config"
import { FlagIcon } from "@/components/FlagIcon"
import { cn } from "@/lib/utils"

export type LegalDocType = "terms-of-service" | "privacy-policy"

interface LegalDocumentViewerProps {
  documentType: LegalDocType
  title: string
  content: Record<Locale, string>
  initialLocale: Locale
  otherDocument: {
    href: string
    type: LegalDocType
    label: string
  }
}

export function LegalDocumentViewer({
  documentType,
  title,
  content,
  initialLocale,
  otherDocument,
}: LegalDocumentViewerProps) {
  const t = useTranslations("Legal")
  const [selectedLocale, setSelectedLocale] = useState<Locale>(initialLocale)

  const IconComponent =
    documentType === "terms-of-service" ? ScrollText : ShieldCheck
  const OtherIconComponent =
    otherDocument.type === "terms-of-service" ? ScrollText : ShieldCheck

  const activeContent = content[selectedLocale] || content.en

  return (
    <div className="container mx-auto max-w-4xl space-y-6 px-4 py-8 sm:space-y-8 sm:px-10 sm:py-16">
      {/* Top Header & Switcher */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Icon Heading */}
        <div className="flex items-center gap-3">
          <div className="flex shrink-0 items-center justify-center rounded-2xl bg-primary/10 p-2.5 text-primary shadow-xs">
            <IconComponent className="h-6 w-6" />
          </div>
          <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
            {title}
          </h1>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center gap-1.5 self-start sm:self-center">
          <div
            role="group"
            aria-label={t("language")}
            className="inline-flex items-center rounded-2xl border border-border/70 bg-muted/80 p-1 shadow-xs backdrop-blur-xs"
          >
            {SUPPORTED_LOCALES.map((loc) => {
              const isSelected = selectedLocale === loc
              const info = LOCALE_LABELS[loc]
              return (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setSelectedLocale(loc)}
                  aria-pressed={isSelected}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all select-none",
                    isSelected
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:bg-background/40 hover:text-foreground"
                  )}
                >
                  <FlagIcon locale={loc} className="h-3.5 w-4.5" />
                  <span>{info.nativeName}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Warning Card for Non-English Versions (Ukrainian) */}
      {selectedLocale === "uk" && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-card-foreground shadow-xs sm:p-5 dark:border-amber-500/20 dark:bg-amber-950/20">
          <div className="mt-0.5 flex shrink-0 items-center justify-center rounded-xl bg-amber-500/20 p-2 text-amber-600 dark:text-amber-400">
            <Scale className="h-5 w-5" />
          </div>
          <p className="text-xs leading-relaxed text-foreground/90 sm:text-sm">
            {t("precedenceNoticeDesc")}{" "}
            <button
              type="button"
              onClick={() => setSelectedLocale("en")}
              className="inline cursor-pointer font-medium text-amber-700 underline underline-offset-4 transition-colors hover:text-amber-900 dark:text-amber-300 dark:hover:text-amber-100"
            >
              {t("viewOriginalEnglish")}.
            </button>
          </p>
        </div>
      )}

      {/* Main Content Card */}
      <Card className="flex flex-col gap-6 overflow-hidden rounded-3xl border-border/80 bg-card p-6 shadow-sm sm:p-10">
        <LegalMarkdown content={activeContent} />
      </Card>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-between border-t border-border/60 pt-4 text-xs text-muted-foreground sm:text-sm">
        <Link
          href={otherDocument.href}
          className="inline-flex items-center gap-2 underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          <OtherIconComponent className="h-4 w-4 text-primary" />
          <span>{otherDocument.label}</span>
        </Link>
        <Link
          href="/settings"
          className="underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          Cardie
        </Link>
      </div>
    </div>
  )
}
