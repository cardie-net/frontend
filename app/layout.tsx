import type { Metadata, Viewport } from "next"
import { Geist_Mono, Inter, Onest, Space_Grotesk, Lora } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { CustomThemeProvider } from "@/components/theme/custom-theme-provider"
import { ThemeScript } from "@/components/theme/theme-script"
import { cn } from "@/lib/utils"
import { AuthProvider } from "@/lib/AuthContext"
import { Navbar } from "@/components/Navbar"
import { Providers } from "@/components/Providers"
import { NextIntlClientProvider } from "next-intl"
import { getLocale, getMessages } from "next-intl/server"

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
})

const onest = Onest({
  subsets: ["latin", "cyrillic"],
  variable: "--font-onest",
  display: "swap",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
})

const lora = Lora({
  subsets: ["latin", "cyrillic"],
  variable: "--font-lora",
  display: "swap",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export const metadata: Metadata = {
  title: "Cardie",
  description: "Flashcards and spaced repetition learning app",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={cn(
        "antialiased dark",
        fontMono.variable,
        inter.variable,
        onest.variable,
        spaceGrotesk.variable,
        lora.variable,
        "font-sans"
      )}
    >
      <head>
        <ThemeScript />
      </head>
      <body>
        <CustomThemeProvider>
          <ThemeProvider>
            <Providers>
              <AuthProvider>
                <NextIntlClientProvider messages={messages}>
                  <Navbar />
                  <main>{children}</main>
                </NextIntlClientProvider>
              </AuthProvider>
            </Providers>
          </ThemeProvider>
        </CustomThemeProvider>
      </body>
    </html>
  )
}
