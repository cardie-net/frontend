import type { Metadata } from "next"
import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { ShieldCheck, ScrollText } from "lucide-react"
import { Card } from "@/components/ui/card"
import { LegalMarkdown } from "@/components/LegalMarkdown"
import { getLegalDocument } from "@/lib/legal"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Legal")
  return {
    title: `${t("privacyPolicy")} - Cardie`,
    description: "Privacy Policy and data protection details for Cardie.",
  }
}

export default async function PrivacyPolicyPage() {
  const t = await getTranslations("Legal")
  const content = getLegalDocument("privacy-policy.md")

  return (
    <div className="container mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-10 sm:py-16">
      {/* Icon Heading */}
      <div className="flex items-center gap-3">
        <div className="flex shrink-0 items-center justify-center rounded-2xl bg-primary/10 p-2.5 text-primary shadow-sm">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
          {t("privacyPolicy")}
        </h1>
      </div>

      {/* Main Content Card */}
      <Card className="flex flex-col gap-6 overflow-hidden rounded-3xl border-border/80 bg-card p-6 shadow-sm sm:p-10">
        <LegalMarkdown content={content} />
      </Card>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-between border-t border-border/60 pt-4 text-xs sm:text-sm text-muted-foreground">
        <Link
          href="/terms-of-service"
          className="inline-flex items-center gap-2 transition-colors hover:text-foreground hover:underline underline-offset-4"
        >
          <ScrollText className="h-4 w-4 text-primary" />
          <span>{t("termsOfService")}</span>
        </Link>
        <Link
          href="/settings"
          className="transition-colors hover:text-foreground hover:underline underline-offset-4"
        >
          Cardie
        </Link>
      </div>
    </div>
  )
}
