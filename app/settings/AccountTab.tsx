"use client"

import { useState, useRef } from "react"
import { apiFetch } from "@/lib/api"
import { useAuth } from "@/lib/AuthContext"
import {
  AlertCircle,
  CheckCircle2,
  Upload,
  User,
  Trash2,
  Globe,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { SocialLinks, UserProfile } from "@/types"
import { AvatarEditorDialog } from "@/components/settings/AvatarEditorDialog"

interface PlatformConfig {
  key: keyof SocialLinks
  label: string
  icon: React.ReactNode
  prefixDisplay: string
  placeholder: string
  isFullUrlRequired: boolean
}

const PLATFORM_CONFIGS: PlatformConfig[] = [
  {
    key: "website",
    label: "Website",
    icon: <Globe className="h-4 w-4" />,
    prefixDisplay: "",
    placeholder: "yourwebsite.com",
    isFullUrlRequired: true,
  },
  {
    key: "github",
    label: "GitHub",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
      </svg>
    ),
    prefixDisplay: "github.com/",
    placeholder: "username",
    isFullUrlRequired: false,
  },
  {
    key: "twitter",
    label: "X (Twitter)",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    prefixDisplay: "x.com/",
    placeholder: "username",
    isFullUrlRequired: false,
  },
  {
    key: "instagram",
    label: "Instagram",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
    prefixDisplay: "instagram.com/",
    placeholder: "username",
    isFullUrlRequired: false,
  },
  {
    key: "youtube",
    label: "YouTube",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    prefixDisplay: "youtube.com/@",
    placeholder: "channel",
    isFullUrlRequired: false,
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    prefixDisplay: "linkedin.com/in/",
    placeholder: "username",
    isFullUrlRequired: false,
  },
  {
    key: "tiktok",
    label: "TikTok",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.51a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.98a8.21 8.21 0 0 0 4.76 1.52V7.05a4.84 4.84 0 0 1-1-.36z" />
      </svg>
    ),
    prefixDisplay: "tiktok.com/@",
    placeholder: "username",
    isFullUrlRequired: false,
  },
  {
    key: "facebook",
    label: "Facebook",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    prefixDisplay: "facebook.com/",
    placeholder: "username",
    isFullUrlRequired: false,
  },
]

function extractUsernameFromUrl(key: keyof SocialLinks, url: string): string {
  if (!url) return ""
  if (key === "website") return url
  const clean = url.trim()
  switch (key) {
    case "github":
      return clean.replace(/^https?:\/\/(www\.)?github\.com\//i, "").replace(/\/$/, "")
    case "twitter":
      return clean.replace(/^https?:\/\/(www\.)?(twitter\.com|x\.com)\//i, "").replace(/\/$/, "")
    case "instagram":
      return clean.replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/\/$/, "")
    case "youtube":
      return clean.replace(/^https?:\/\/(www\.)?youtube\.com\/@?/i, "").replace(/^@/, "").replace(/\/$/, "")
    case "linkedin":
      return clean.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, "").replace(/\/$/, "")
    case "tiktok":
      return clean.replace(/^https?:\/\/(www\.)?tiktok\.com\/@?/i, "").replace(/^@/, "").replace(/\/$/, "")
    case "facebook":
      return clean.replace(/^https?:\/\/(www\.)?facebook\.com\//i, "").replace(/\/$/, "")
    default:
      return clean
  }
}

function buildSocialUrl(key: keyof SocialLinks, input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return ""
  if (key === "website") {
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  }
  const username = extractUsernameFromUrl(key, trimmed)
  if (!username) return ""

  switch (key) {
    case "github":
      return `https://github.com/${username}`
    case "twitter":
      return `https://x.com/${username}`
    case "instagram":
      return `https://instagram.com/${username}`
    case "youtube":
      return `https://youtube.com/@${username}`
    case "linkedin":
      return `https://linkedin.com/in/${username}`
    case "tiktok":
      return `https://tiktok.com/@${username}`
    case "facebook":
      return `https://facebook.com/${username}`
    default:
      return ""
  }
}

const BIO_MAX_LENGTH = 500

export function AccountTab() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="font-medium text-muted-foreground">
        Loading account details...
      </div>
    )
  }

  if (!user) {
    return (
      <div className="font-medium text-muted-foreground">
        Please log in to manage your account.
      </div>
    )
  }

  return <AccountForm key={user.id} user={user} />
}

const validateDisplayName = (name: string): string => {
  const trimmed = name.trim()
  if (!trimmed) {
    return "Display name cannot be empty."
  }
  if (trimmed.length < 2) {
    return "Display name must be at least 2 characters long."
  }
  if (trimmed.length > 50) {
    return "Display name must be 50 characters or fewer."
  }
  return ""
}

const validateUsername = (name: string): string => {
  if (!name) {
    return "Username cannot be empty."
  }
  if (name.length < 8) {
    return "Username must be at least 8 characters long."
  }
  if (name.length > 32) {
    return "Username must be 32 characters or fewer."
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
    return "Username can only contain letters, numbers, underscores, and dashes."
  }
  return ""
}

function AccountForm({ user }: { user: UserProfile }) {
  const { refreshUser } = useAuth()
  const [displayName, setDisplayName] = useState(user.display_name || "")
  const [username, setUsername] = useState(user.username || "")
  const [displayNameError, setDisplayNameError] = useState<string>("")
  const [usernameError, setUsernameError] = useState<string>("")
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || "")
  const [bio, setBio] = useState(user.bio || "")

  const initialSocialInputs: Record<keyof SocialLinks, string> = {
    website: extractUsernameFromUrl("website", user.social_links?.website || ""),
    github: extractUsernameFromUrl("github", user.social_links?.github || ""),
    twitter: extractUsernameFromUrl("twitter", user.social_links?.twitter || ""),
    instagram: extractUsernameFromUrl("instagram", user.social_links?.instagram || ""),
    youtube: extractUsernameFromUrl("youtube", user.social_links?.youtube || ""),
    linkedin: extractUsernameFromUrl("linkedin", user.social_links?.linkedin || ""),
    tiktok: extractUsernameFromUrl("tiktok", user.social_links?.tiktok || ""),
    facebook: extractUsernameFromUrl("facebook", user.social_links?.facebook || ""),
  }

  const [socialInputs, setSocialInputs] = useState<Record<keyof SocialLinks, string>>(initialSocialInputs)
  const [bioAndSocialExpanded, setBioAndSocialExpanded] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [selectedImageSrc, setSelectedImageSrc] = useState<string>("")
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.")
      scrollToTop()
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        setSelectedImageSrc(event.target.result)
        setIsEditorOpen(true)
      }
    }
    reader.readAsDataURL(file)

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSaveCroppedAvatar = async (blob: Blob) => {
    setIsUploadingAvatar(true)
    setError("")
    setSuccess("")

    const formData = new FormData()
    formData.append("file", blob, "avatar.jpg")

    try {
      const response = await apiFetch("/api/v1/users/me/avatar", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setAvatarUrl(data.avatar_url || "")
        setSuccess("Profile picture updated successfully.")
        scrollToTop()
        setIsEditorOpen(false)
        setSelectedImageSrc("")
        await refreshUser()
      } else {
        const errData = await response.json().catch(() => ({}))
        setError(
          typeof errData.detail === "string"
            ? errData.detail
            : "Failed to upload profile picture."
        )
        scrollToTop()
      }
    } catch {
      setError("An error occurred while uploading. Please try again.")
      scrollToTop()
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleRemoveAvatar = async () => {
    setIsUploadingAvatar(true)
    setError("")
    setSuccess("")

    try {
      const response = await apiFetch("/api/v1/users/me/avatar", {
        method: "DELETE",
      })

      if (response.ok) {
        setAvatarUrl("")
        setSuccess("Profile picture removed successfully.")
        scrollToTop()
        await refreshUser()
      } else {
        const errData = await response.json().catch(() => ({}))
        setError(
          typeof errData.detail === "string"
            ? errData.detail
            : "Failed to remove profile picture."
        )
        scrollToTop()
      }
    } catch {
      setError("An error occurred while removing. Please try again.")
      scrollToTop()
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleDisplayNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setDisplayName(val)
    setDisplayNameError(validateDisplayName(val))
  }

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setUsername(val)
    setUsernameError(validateUsername(val))
  }

  const handleSocialInputChange = (key: keyof SocialLinks, rawValue: string) => {
    const extracted = extractUsernameFromUrl(key, rawValue)
    setSocialInputs((prev) => ({
      ...prev,
      [key]: extracted,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    const dErr = validateDisplayName(displayName)
    const uErr = validateUsername(username)
    setDisplayNameError(dErr)
    setUsernameError(uErr)

    if (dErr || uErr) {
      setError(dErr || uErr)
      scrollToTop()
      return
    }

    if (bio.length > BIO_MAX_LENGTH) {
      setError(`Bio must be ${BIO_MAX_LENGTH} characters or fewer.`)
      scrollToTop()
      return
    }

    const cleanSocialLinks: SocialLinks = {}
    let hasSocialLinks = false

    for (const config of PLATFORM_CONFIGS) {
      const val = socialInputs[config.key]?.trim()
      if (!val) continue

      if (config.key === "website") {
        let websiteUrl = val
        if (!/^https?:\/\//i.test(websiteUrl)) {
          websiteUrl = `https://${websiteUrl}`
        }
        const urlPattern = /^https?:\/\/[^\s/$.?#].[^\s]*$/i
        if (!urlPattern.test(websiteUrl)) {
          setError("Website URL must be a valid web address.")
          scrollToTop()
          return
        }
        cleanSocialLinks.website = websiteUrl
        hasSocialLinks = true
      } else {
        const usernameVal = extractUsernameFromUrl(config.key, val)
        if (!/^[a-zA-Z0-9_.-]+$/.test(usernameVal)) {
          setError(`Invalid username for ${config.label}. Use only letters, numbers, dots, hyphens, and underscores.`)
          scrollToTop()
          return
        }
        const builtUrl = buildSocialUrl(config.key, usernameVal)
        if (builtUrl) {
          cleanSocialLinks[config.key] = builtUrl
          hasSocialLinks = true
        }
      }
    }

    setIsSaving(true)

    try {
      const response = await apiFetch("/api/v1/users/me", {
        method: "PATCH",
        body: JSON.stringify({
          display_name: displayName,
          username: username,
          bio: bio || null,
          social_links: hasSocialLinks ? cleanSocialLinks : null,
        }),
      })

      if (response.ok) {
        setSuccess("Profile updated successfully.")
        scrollToTop()
        await refreshUser()
      } else {
        const errData = await response.json().catch(() => ({}))
        if (errData.detail === "UPDATE_USER_EMAIL_ALREADY_EXISTS") {
          setError("A user with that email already exists.")
        } else {
          setError(
            typeof errData.detail === "string"
              ? errData.detail
              : "Failed to update profile."
          )
        }
        scrollToTop()
      }
    } catch {
      setError("An error occurred. Please try again.")
      scrollToTop()
    } finally {
      setIsSaving(false)
    }
  }

  const filledLinksCount = Object.values(socialInputs).filter(
    (v) => v && v.trim()
  ).length

  return (
    <div className="mx-auto w-full max-w-2xl">
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-green-500 bg-green-50/50 text-green-900 dark:bg-green-900/20 dark:text-green-300">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="mb-8 flex items-center gap-4 sm:gap-6">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-border bg-muted">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            <User className="h-12 w-12 text-muted-foreground" />
          )}
        </div>
        <div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            disabled={isUploadingAvatar}
          />
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              type="button"
              variant="secondary"
              className="flex items-center gap-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
            >
              <Upload className="h-4 w-4" />
              <span className="sm:hidden">
                {isUploadingAvatar ? "Uploading..." : "Upload"}
              </span>
              <span className="hidden sm:inline">
                {isUploadingAvatar ? "Uploading..." : "Upload Avatar"}
              </span>
            </Button>
            {avatarUrl && (
              <Button
                type="button"
                variant="destructive"
                className="flex h-8 w-8 items-center justify-center gap-2 p-0 sm:h-8 sm:w-auto sm:px-3"
                onClick={handleRemoveAvatar}
                disabled={isUploadingAvatar}
                aria-label="Remove avatar"
                title="Remove avatar"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Remove</span>
              </Button>
            )}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Recommended: Square image, max 10MB.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="displayName">Display Name</Label>
          <Input
            id="displayName"
            type="text"
            value={displayName}
            onChange={handleDisplayNameChange}
            aria-invalid={!!displayNameError}
          />
          {displayNameError && (
            <p className="mt-1 flex items-center gap-1.5 text-xs text-destructive">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {displayNameError}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={handleUsernameChange}
            aria-invalid={!!usernameError}
          />
          {usernameError && (
            <p className="mt-1 flex items-center gap-1.5 text-xs text-destructive">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {usernameError}
            </p>
          )}
        </div>

        {/* Simpler Collapsible Bio & Social Links Section (No card/border, same indentation) */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setBioAndSocialExpanded(!bioAndSocialExpanded)}
            className="group flex items-center gap-2 cursor-pointer text-left font-medium transition-colors hover:text-primary py-1"
          >
            <span className="text-muted-foreground transition-colors group-hover:text-primary">
              {bioAndSocialExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </span>
            <span className="text-sm font-semibold">Bio & Social Links</span>
            {filledLinksCount > 0 && (
              <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
                {filledLinksCount} {filledLinksCount === 1 ? "link" : "links"}
              </span>
            )}
          </button>

          {bioAndSocialExpanded && (
            <div className="space-y-6 pt-1">
              {/* Bio Field */}
              <div className="relative">
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={BIO_MAX_LENGTH}
                  rows={3}
                  placeholder="Tell others a bit about yourself..."
                  className="min-h-[90px] pb-6 resize-y"
                />
                <span
                  className={`absolute bottom-2.5 right-3 text-xs select-none pointer-events-none ${
                    bio.length > BIO_MAX_LENGTH * 0.9
                      ? bio.length >= BIO_MAX_LENGTH
                        ? "text-destructive font-semibold"
                        : "text-amber-500 font-semibold"
                      : "text-muted-foreground"
                  }`}
                >
                  {bio.length}/{BIO_MAX_LENGTH}
                </span>
              </div>

              {/* Social Links Section */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-muted-foreground">
                  Social Links
                </Label>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {PLATFORM_CONFIGS.map((platform) => (
                    <div key={platform.key} className="flex flex-col gap-1.5">
                      <Label htmlFor={`social-${platform.key}`} className="text-xs font-medium">
                        {platform.label}
                      </Label>
                      <div className="flex items-center rounded-2xl border border-transparent bg-input/50 transition-[color,box-shadow] duration-200 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30 overflow-hidden h-9 px-1">
                        <div
                          className="flex h-full w-8 shrink-0 items-center justify-center text-muted-foreground"
                          title={platform.label}
                        >
                          {platform.icon}
                        </div>
                        {platform.prefixDisplay && (
                          <span className="text-xs text-muted-foreground select-none whitespace-nowrap font-mono pr-1">
                            {platform.prefixDisplay}
                          </span>
                        )}
                        <Input
                          id={`social-${platform.key}`}
                          type={platform.isFullUrlRequired ? "url" : "text"}
                          value={socialInputs[platform.key] || ""}
                          onChange={(e) =>
                            handleSocialInputChange(platform.key, e.target.value)
                          }
                          placeholder={platform.placeholder}
                          className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-full text-sm px-1.5 shadow-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSaving || !!displayNameError || !!usernameError}
          className="w-full sm:w-auto"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </form>

      {isEditorOpen && (
        <AvatarEditorDialog
          isOpen={isEditorOpen}
          imageSrc={selectedImageSrc}
          onClose={() => {
            setIsEditorOpen(false)
            setSelectedImageSrc("")
          }}
          onSave={handleSaveCroppedAvatar}
          isUploading={isUploadingAvatar}
        />
      )}
    </div>
  )
}
