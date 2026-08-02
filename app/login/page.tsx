"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { apiFetch } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/AuthContext"
import GoogleSignInButton from "@/components/GoogleSignInButton"
import AuthDivider from "@/components/AuthDivider"

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  oauth_invalid_state: "Authentication failed. Please try again",
  oauth_state_expired: "Authentication session expired. Please try again",
  oauth_csrf_mismatch: "Security check failed. Please try again",
  oauth_no_email: "Could not retrieve your email from Google",
  oauth_profile_error: "Could not retrieve your Google profile",
  oauth_user_exists:
    "An account with this email already exists with a different sign-in method",
  oauth_user_inactive: "Your account has been deactivated",
}

function LoginContent() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  // Pre-fill from the OAuth redirect (`/login?error=...`); the page remounts on
  // navigation, so a one-time initializer is sufficient.
  const [error, setError] = useState<React.ReactNode>(() => {
    const oauthError = searchParams.get("error")
    return oauthError && OAUTH_ERROR_MESSAGES[oauthError]
      ? OAUTH_ERROR_MESSAGES[oauthError]
      : ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const { refreshUser } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.")
      setIsLoading(false)
      return
    }

    if (!password) {
      setError("Please enter your password.")
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
        window.location.href = "/"
      } else {
        const errData = await response.json().catch(() => ({}))
        if (errData.detail === "USER_NOT_VERIFIED") {
          setError(
            <span>
              Your email is not verified.{" "}
              <Link
                href={`/verify?email=${encodeURIComponent(email)}`}
                className="underline"
              >
                Verify now
              </Link>
            </span>
          )
        } else if (errData.detail === "LOGIN_BAD_CREDENTIALS") {
          setError("Invalid email or password")
        } else {
          setError(
            typeof errData.detail === "string"
              ? errData.detail
              : "Invalid email or password"
          )
        }
      }
    } catch {
      setError("An error occurred while logging in. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md rounded-lg border bg-background p-6 text-foreground shadow-sm sm:p-8">
      <h1 className="mb-2 text-2xl font-bold sm:text-3xl">Welcome Back</h1>
      <p className="mb-6 text-muted-foreground">Sign in to continue</p>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <GoogleSignInButton />

      <AuthDivider />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-muted-foreground hover:underline"
            >
              Forgot password?
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
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <p className="mt-6 flex justify-center gap-1 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?
        <Link
          href="/signup"
          className="font-medium text-foreground hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="w-full max-w-md rounded-lg border bg-background p-6 text-center sm:p-8">
            Loading...
          </div>
        }
      >
        <LoginContent />
      </Suspense>
    </div>
  )
}
