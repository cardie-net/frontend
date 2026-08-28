"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { apiFetch } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/AuthContext"
import GoogleSignInButton from "@/components/GoogleSignInButton"
import AuthDivider from "@/components/AuthDivider"
import { Card, CardContent } from "@/components/ui/card"

function LoginContent() {
  const t = useTranslations("Auth.login")
  const tOauth = useTranslations("Auth.oauth")
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const getOAuthErrorMessage = (key: string | null): string => {
    if (!key) return ""
    switch (key) {
      case "oauth_invalid_state":
        return tOauth("invalidState")
      case "oauth_state_expired":
        return tOauth("stateExpired")
      case "oauth_csrf_mismatch":
        return tOauth("csrfMismatch")
      case "oauth_no_email":
        return tOauth("noEmail")
      case "oauth_profile_error":
        return tOauth("profileError")
      case "oauth_user_exists":
        return tOauth("userExists")
      case "oauth_user_inactive":
        return tOauth("userInactive")
      default:
        return ""
    }
  }

  // Pre-fill from the OAuth redirect (`/login?error=...`); the page remounts on
  // navigation, so a one-time initializer is sufficient.
  const [error, setError] = useState<React.ReactNode>(() => {
    const oauthError = searchParams.get("error")
    return getOAuthErrorMessage(oauthError)
  })
  const [isLoading, setIsLoading] = useState(false)
  const { refreshUser } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t("validEmailRequired"))
      setIsLoading(false)
      return
    }

    if (!password) {
      setError(t("passwordRequired"))
      setIsLoading(false)
      return
    }

    try {
      const formData = new URLSearchParams()
      formData.append("username", email) // fastapi_users expects 'username' for email
      formData.append("password", password)

      const response = await apiFetch(`/api/v1/auth/jwt/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      })

      if (response.ok) {
        await refreshUser()
        window.location.href = "/decks"
      } else {
        const errData = await response.json().catch(() => ({}))
        // Note: USER_NOT_VERIFIED can no longer occur - unverified accounts
        // do not exist under deferred promotion.
        if (errData.detail === "LOGIN_BAD_CREDENTIALS") {
          setError(t("invalidCredentials"))
        } else {
          setError(
            typeof errData.detail === "string"
              ? errData.detail
              : t("invalidCredentials")
          )
        }
      }
    } catch {
      setError(t("genericError"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md overflow-hidden rounded-3xl border-border/80 bg-card shadow-md">
      <CardContent className="p-6 sm:p-8">
        <h1 className="mb-2 text-2xl font-bold sm:text-3xl">{t("title")}</h1>
        <p className="mb-6 text-muted-foreground">{t("subtitle")}</p>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <GoogleSignInButton />

        <AuthDivider />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t("emailLabel")}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t("emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">{t("passwordLabel")}</Label>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-muted-foreground hover:underline"
              >
                {t("forgotPassword")}
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t("signingIn") : t("signIn")}
          </Button>
        </form>

        <p className="mt-6 flex justify-center gap-1 text-center text-sm text-muted-foreground">
          {t("noAccount")}
          <Link
            href="/signup"
            className="font-medium text-foreground hover:underline"
          >
            {t("signUp")}
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}

export default function LoginPage() {
  const tCommon = useTranslations("Common")

  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <Suspense
        fallback={
          <Card className="w-full max-w-md overflow-hidden rounded-3xl border-border/80 bg-card shadow-md">
            <CardContent className="p-6 text-center text-muted-foreground sm:p-8">
              {tCommon("loading")}
            </CardContent>
          </Card>
        }
      >
        <LoginContent />
      </Suspense>
    </div>
  )
}
