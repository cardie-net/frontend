"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { apiFetch } from "@/lib/api"
import { useAuth } from "@/lib/AuthContext"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"

function VerifyContent() {
  const t = useTranslations("Auth.verify")
  const router = useRouter()
  const { refreshUser } = useAuth()
  const searchParams = useSearchParams()
  const [token, setToken] = useState(searchParams.get("token") || "")
  const [email, setEmail] = useState(searchParams.get("email") || "")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((c) => c - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [cooldown])

  const handleResend = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t("validEmailRequired"))
      return
    }
    setError("")
    setResendSuccess(false)
    setIsResending(true)

    try {
      const response = await apiFetch(`/api/v1/auth/request-verify-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setResendSuccess(true)
        setCooldown(60)
      } else {
        setError(t("resendFailed"))
      }
    } catch {
      setError(t("genericError"))
    } finally {
      setIsResending(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    if (!token.trim()) {
      setError(t("tokenRequired"))
      return
    }

    setIsLoading(true)

    try {
      const response = await apiFetch(`/api/v1/auth/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      })

      if (response.ok) {
        setSuccess(true)
        try {
          await refreshUser()
        } catch {
          // Session refresh is best-effort; the redirect still happens.
        }
        setTimeout(() => {
          router.push("/decks")
        }, 3000)
      } else {
        const errData = await response.json().catch(() => ({}))
        if (errData.detail) {
          if (errData.detail === "VERIFY_USER_BAD_TOKEN") {
            setError(t("badToken"))
          } else if (errData.detail === "VERIFY_USER_EMAIL_TAKEN") {
            setError(t("emailTaken"))
          } else {
            setError(
              typeof errData.detail === "string" ? errData.detail : t("failed")
            )
          }
        } else {
          setError(t("failed"))
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
          <Alert variant="destructive" className="mb-6 flex gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-6 flex gap-2 border-green-500 bg-green-50 text-left text-green-700 dark:bg-green-900/20 dark:text-green-400">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <AlertDescription>{t("successMessage")}</AlertDescription>
          </Alert>
        )}
        {resendSuccess && (
          <Alert className="mb-6 flex gap-2 border-green-500 bg-green-50 text-left text-green-700 dark:bg-green-900/20 dark:text-green-400">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <AlertDescription>{t("resendSuccess")}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="token">{t("tokenLabel")}</Label>
            <Input
              id="token"
              type="text"
              placeholder={t("tokenPlaceholder")}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || success}
          >
            {isLoading ? t("verifying") : t("verify")}
          </Button>
        </form>

        <div className="mt-8 border-t pt-4">
          <p className="mb-4 text-muted-foreground">{t("didntReceive")}</p>
          <div className="space-y-4">
            <Input
              id="email"
              type="email"
              placeholder={t("resendEmailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleResend}
              disabled={isResending || cooldown > 0 || success}
            >
              {isResending
                ? t("verifying")
                : cooldown > 0
                  ? t("resendIn", { seconds: cooldown })
                  : t("resendButton")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function VerifyPage() {
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
        <VerifyContent />
      </Suspense>
    </div>
  )
}
