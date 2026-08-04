"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/AuthContext"
import { cn } from "@/lib/utils"
import { getDeckColorClass } from "@/lib/decks"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Globe, Link as LinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useProfile, useUserDecks } from "@/hooks/useProfile"

export default function ProfilePage() {
  const params = useParams<{ username: string }>()
  const username = params.username

  const { user: currentUser } = useAuth()


  const {
    data: profileUser,
    isLoading: profileLoading,
    error,
  } = useProfile(username)
  const { data: decks = [], isLoading: decksLoading } = useUserDecks(
    profileUser?.id
  )

  const loading = profileLoading || (!!profileUser && decksLoading)

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl space-y-8 px-4 py-10">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
        <Skeleton className="h-[200px] w-full rounded-xl" />
      </div>
    )
  }

  if (error || !profileUser) {
    return (
      <div className="mt-20 flex flex-1 items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
          <h2 className="mb-4 text-2xl font-bold">
            {error?.message || "Profile not found"}
          </h2>
          <Link href="/">
            <Button variant="outline">Go back home</Button>
          </Link>
        </div>
      </div>
    )
  }

  const isOwnProfile = currentUser && currentUser.id === profileUser.id

  const renderSocialIcon = (key: string) => {
    switch (key) {
      case "website":
        return <Globe className="h-4 w-4" />
      case "github":
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
        )
      case "twitter":
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        )
      case "instagram":
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
          </svg>
        )
      case "youtube":
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
        )
      case "linkedin":
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        )
      case "tiktok":
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.51a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.98a8.21 8.21 0 0 0 4.76 1.52V7.05a4.84 4.84 0 0 1-1-.36z" />
          </svg>
        )
      case "facebook":
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        )
      default:
        return <LinkIcon className="h-4 w-4" />
    }
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10">
      <Card className="mb-10 overflow-hidden border-none shadow-md">
        <div className="h-32 w-full bg-muted"></div>
        <CardContent className="relative px-6 pt-0 pb-10 sm:px-10">
          <div className="-mt-16 mb-6 flex flex-col gap-6 sm:-mt-12 sm:flex-row sm:items-end">
            <Avatar className="h-32 w-32 border-4 border-background bg-muted">
              {profileUser.avatar_url ? (
                <AvatarImage
                  src={profileUser.avatar_url}
                  alt={profileUser.display_name}
                />
              ) : (
                <AvatarFallback className="text-4xl">
                  {profileUser.display_name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>

            <div className="flex-1 pb-2">
              <h1 className="flex items-center gap-3 text-3xl font-bold">
                {profileUser.display_name}
                {profileUser.is_guest && (
                  <Badge variant="secondary">Guest</Badge>
                )}
              </h1>
              <p className="font-mono text-muted-foreground">
                @{profileUser.username}
              </p>
            </div>

            {isOwnProfile && (
              <div className="pb-2">
                <Link href="/settings">
                  <Button variant="outline">Edit Profile</Button>
                </Link>
              </div>
            )}
          </div>

          {profileUser.bio && (
            <div className="mt-6 text-lg leading-relaxed">{profileUser.bio}</div>
          )}

          {profileUser.social_links &&
            Object.values(profileUser.social_links).some((u) => u && u.trim()) && (
              <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
                {Object.entries(profileUser.social_links).map(([key, url]) => {
                  if (!url || !url.trim()) return null
                  let displayLabel = key
                  try {
                    if (key === "website") {
                      displayLabel = new URL(url.startsWith("http") ? url : `https://${url}`).hostname
                    } else {
                      const usernamePart = url.split("/").filter(Boolean).pop() || key
                      displayLabel = `@${usernamePart.replace(/^@/, "")}`
                    }
                  } catch {
                    displayLabel = url
                  }

                  return (
                    <a
                      key={key}
                      href={url.startsWith("http") ? url : `https://${url}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 rounded-lg border bg-card p-3 text-sm font-medium transition-all hover:bg-accent/50 hover:shadow-sm"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary text-secondary-foreground shrink-0">
                        {renderSocialIcon(key)}
                      </div>
                      <div className="flex flex-col truncate">
                        <span className="capitalize text-xs text-muted-foreground">
                          {key === "twitter" ? "X (Twitter)" : key}
                        </span>
                        <span className="truncate text-foreground font-semibold">
                          {displayLabel}
                        </span>
                      </div>
                    </a>
                  )
                })}
              </div>
            )}

        </CardContent>
      </Card>

      <div>
        <div className="mb-6 flex items-center gap-3">
          <h2 className="text-2xl font-bold">Decks</h2>
          <Badge variant="secondary" className="rounded-full">
            {decks.length}
          </Badge>
        </div>

        {decks.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed p-12 text-center text-muted-foreground">
            <p className="mb-2 text-lg font-medium">No decks yet</p>
            {isOwnProfile && (
              <Link href="/decks?new=true">
                <Button variant="link">Create your first deck</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {decks.map((deck) => (
              <Link
                href={`/${profileUser.username}/${deck.slug}`}
                key={deck.id}
                className="block h-full"
              >
                <Card
                  className={cn(
                    "group flex h-full cursor-pointer flex-col border-2 transition-shadow hover:shadow-md",
                    getDeckColorClass(deck.properties?.color)
                  )}
                >
                  <CardHeader>
                    <CardTitle className="line-clamp-2 transition-colors group-hover:text-primary">
                      {deck.name}
                    </CardTitle>
                    {deck.description && (
                      <CardDescription className="line-clamp-2">
                        {deck.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
