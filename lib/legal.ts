import fs from "node:fs"
import path from "node:path"
import type { Locale } from "@/i18n/config"

export type LegalDocSlug = "terms-of-service" | "privacy-policy"

export function getLegalDocument(
  docOrFile: LegalDocSlug | "terms-of-service.md" | "privacy-policy.md" | string,
  locale: string = "en"
): string {
  try {
    const slug = docOrFile.replace(/\.md$/, "").replace(/\.(en|uk)$/, "")
    const targetLocale = locale || (docOrFile.endsWith(".uk.md") ? "uk" : "en")

    const candidateFiles =
      targetLocale === "en"
        ? [`${slug}.md`, `${slug}.en.md`]
        : [`${slug}.${targetLocale}.md`, `${slug}.md`]

    for (const filename of candidateFiles) {
      const filePath = path.join(process.cwd(), "assets", filename)
      if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, "utf-8")
      }
    }
  } catch (error) {
    console.error(`Failed to read legal document: ${docOrFile} (locale: ${locale})`, error)
  }

  return ""
}

export function getAllLegalDocumentVersions(
  slug: LegalDocSlug
): Record<Locale, string> {
  return {
    en: getLegalDocument(slug, "en"),
    uk: getLegalDocument(slug, "uk"),
  }
}
