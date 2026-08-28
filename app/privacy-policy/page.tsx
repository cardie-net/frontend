import type { Metadata } from "next"
import { getTranslations, getLocale } from "next-intl/server"
import { LegalDocumentViewer } from "@/components/LegalDocumentViewer"
import { getAllLegalDocumentVersions } from "@/lib/legal"
import type { Locale } from "@/i18n/config"

export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Legal")
  return {
    title: `${t("privacyPolicy")} - Cardie`,
    description: "Privacy Policy and data protection details for Cardie.",
  }
}

export default async function PrivacyPolicyPage() {
  const t = await getTranslations("Legal")
  const locale = await getLocale()
  const initialLocale: Locale = locale === "uk" ? "uk" : "en"
  const content = getAllLegalDocumentVersions("privacy-policy")

  return (
    <LegalDocumentViewer
      documentType="privacy-policy"
      title={t("privacyPolicy")}
      content={content}
      initialLocale={initialLocale}
      otherDocument={{
        href: "/terms-of-service",
        type: "terms-of-service",
        label: t("termsOfService"),
      }}
    />
  )
}
