"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"

export function AboutTab() {
  const t = useTranslations("Settings.about")

  return (
    <div className="w-full space-y-3 text-sm leading-relaxed text-muted-foreground">
      <p>
        {t.rich("openSource", {
          apache: (chunks) => (
            <a
              href="https://www.apache.org/licenses/LICENSE-2.0"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-4 transition-colors hover:text-primary"
            >
              {chunks}
            </a>
          ),
          github: (chunks) => (
            <a
              href="https://github.com/cardie-net"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-4 transition-colors hover:text-primary"
            >
              {chunks}
            </a>
          ),
        })}
      </p>

      <p>
        {t.rich("legal", {
          tos: (chunks) => (
            <Link
              href="/terms-of-service"
              className="text-foreground underline underline-offset-4 transition-colors hover:text-primary"
            >
              {chunks}
            </Link>
          ),
          privacy: (chunks) => (
            <Link
              href="/privacy-policy"
              className="text-foreground underline underline-offset-4 transition-colors hover:text-primary"
            >
              {chunks}
            </Link>
          ),
        })}
      </p>

      <p>
        {t.rich("contact", {
          legal: (chunks) => (
            <a
              href="mailto:legal@cardie.net"
              className="text-foreground underline underline-offset-4 transition-colors hover:text-primary"
            >
              {chunks}
            </a>
          ),
          report: (chunks) => (
            <a
              href="mailto:report@cardie.net"
              className="text-foreground underline underline-offset-4 transition-colors hover:text-primary"
            >
              {chunks}
            </a>
          ),
          mail: (chunks) => (
            <a
              href="mailto:mail@cardie.net"
              className="text-foreground underline underline-offset-4 transition-colors hover:text-primary"
            >
              {chunks}
            </a>
          ),
        })}
      </p>
    </div>
  )
}
