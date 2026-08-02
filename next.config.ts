import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin("./i18n/request.ts")

// Backend base URL used by the dev-server /api rewrite.
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000"

const nextConfig: NextConfig = {
  async rewrites() {
    if (process.env.NODE_ENV === "development") {
      return [
        {
          source: "/api/:path*",
          destination: `${BACKEND_URL}/api/:path*`,
        },
      ]
    }
    return []
  },
}

export default withNextIntl(nextConfig)
