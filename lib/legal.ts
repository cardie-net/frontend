import fs from "node:fs"
import path from "node:path"

export function getLegalDocument(filename: "terms-of-service.md" | "privacy-policy.md"): string {
  try {
    const filePath = path.join(process.cwd(), "assets", filename)
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, "utf-8")
    }
  } catch (error) {
    console.error(`Failed to read legal document: ${filename}`, error)
  }

  return ""
}
