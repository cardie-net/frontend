import { Geist_Mono, Inter } from "next/font/google"

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

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

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
        "font-sans",
        inter.variable
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
