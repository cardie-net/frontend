import type { Metadata } from "next"
import { getTranslations, getLocale } from "next-intl/server"
import { LegalDocumentViewer } from "@/components/LegalDocumentViewer"
import { getAllLegalDocumentVersions } from "@/lib/legal"
import type { Locale } from "@/i18n/config"

export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Legal")
  return {
    title: `${t("termsOfService")} - Cardie`,
    description: "Terms of Service and conditions for using Cardie.",
  }
}

export default async function TermsOfServicePage() {
  const t = await getTranslations("Legal")
  const locale = await getLocale()
  const initialLocale: Locale = locale === "uk" ? "uk" : "en"
  const content = getAllLegalDocumentVersions("terms-of-service")

  return (
    <LegalDocumentViewer
      documentType="terms-of-service"
      title={t("termsOfService")}
      content={content}
      initialLocale={initialLocale}
      otherDocument={{
        href: "/privacy-policy",
        type: "privacy-policy",
        label: t("privacyPolicy"),
      }}
    />
  )
}
