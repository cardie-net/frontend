import fs from "node:fs"
import path from "node:path"
import type { Locale } from "@/i18n/config"

export type LegalDocSlug = "terms-of-service" | "privacy-policy"

const SLUG_ALIASES: Record<LegalDocSlug, string[]> = {
  "terms-of-service": ["terms-of-service", "terms", "tos"],
  "privacy-policy": ["privacy-policy", "privacy"],
}

function getSearchDirectories(): string[] {
  const dirs: string[] = []
  if (process.env.LEGAL_DOCS_DIR) {
    dirs.push(process.env.LEGAL_DOCS_DIR)
  }
  dirs.push(path.join(process.cwd(), "legal"))
  dirs.push(path.join(process.cwd(), "assets"))
  dirs.push("/app/legal")
  dirs.push("/app/frontend/legal")
  return dirs
}

function normalizeSlug(docOrSlug: string): LegalDocSlug {
  const cleaned = docOrSlug
    .replace(/\.md$/, "")
    .replace(/\.(en|uk|pt)$/, "")
    .toLowerCase()
  if (cleaned.includes("term") || cleaned.includes("tos")) {
    return "terms-of-service"
  }
  return "privacy-policy"
}

export function getLegalDocument(
  docOrSlug: LegalDocSlug | string,
  locale: string = "en",
  allowFallback = true
): string {
  try {
    const slug = normalizeSlug(docOrSlug)
    const targetLocale = locale || "en"

    // 1. Direct environment variable support
    if (slug === "terms-of-service") {
      const localizedEnv =
        targetLocale !== "en"
          ? process.env[`TERMS_OF_SERVICE_${targetLocale.toUpperCase()}_MD`] ||
            process.env[`TERMS_${targetLocale.toUpperCase()}_MD`]
          : undefined
      if (localizedEnv?.trim()) return localizedEnv

      const defaultEnv = process.env.TERMS_OF_SERVICE_MD || process.env.TERMS_MD
      if (defaultEnv?.trim()) {
        if (targetLocale === "en" || allowFallback) return defaultEnv
      }
    } else if (slug === "privacy-policy") {
      const localizedEnv =
        targetLocale !== "en"
          ? process.env[`PRIVACY_POLICY_${targetLocale.toUpperCase()}_MD`] ||
            process.env[`PRIVACY_${targetLocale.toUpperCase()}_MD`]
          : undefined
      if (localizedEnv?.trim()) return localizedEnv

      const defaultEnv = process.env.PRIVACY_POLICY_MD || process.env.PRIVACY_MD
      if (defaultEnv?.trim()) {
        if (targetLocale === "en" || allowFallback) return defaultEnv
      }
    }

    const aliases = SLUG_ALIASES[slug] || [slug]
    const searchDirs = getSearchDirectories()

    // 2. Check localized candidate files (e.g. terms-of-service.uk.md, terms.uk.md)
    if (targetLocale !== "en") {
      for (const dir of searchDirs) {
        if (!fs.existsSync(dir)) continue
        for (const alias of aliases) {
          const filePath = path.join(dir, `${alias}.${targetLocale}.md`)
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            return fs.readFileSync(filePath, "utf-8")
          }
        }
      }
      if (!allowFallback) {
        return ""
      }
    }

    // 3. Check English / default candidate files (e.g. terms-of-service.en.md, terms.md, tos.md)
    const defaultCandidates: string[] = []
    for (const alias of aliases) {
      defaultCandidates.push(`${alias}.en.md`)
      defaultCandidates.push(`${alias}.md`)
    }

    for (const dir of searchDirs) {
      if (!fs.existsSync(dir)) continue
      for (const filename of defaultCandidates) {
        const filePath = path.join(dir, filename)
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          return fs.readFileSync(filePath, "utf-8")
        }
      }
    }
  } catch (error) {
    console.error(
      `Failed to read legal document: ${docOrSlug} (locale: ${locale})`,
      error
    )
  }

  return ""
}

export function getAllLegalDocumentVersions(
  slug: LegalDocSlug
): Record<Locale, string> {
  return {
    en: getLegalDocument(slug, "en", true),
    uk: getLegalDocument(slug, "uk", false),
  }
}
