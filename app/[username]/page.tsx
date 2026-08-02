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
            <div className="mt-6 text-lg">{profileUser.bio}</div>
          )}

          {profileUser.social_links &&
            Object.keys(profileUser.social_links).length > 0 && (
              <div className="mt-6 flex flex-wrap gap-3 border-t pt-6">
                {Object.entries(profileUser.social_links).map(([key, url]) => {
                  if (!url) return null
                  return (
                    <a
                      key={key}
                      href={url.startsWith("http") ? url : `https://${url}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
                    >
                      {renderSocialIcon(key)}
                      <span className="capitalize">
                        {key === "website" ? new URL(url).hostname : key}
                      </span>
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
