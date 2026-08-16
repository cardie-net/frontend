"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { useAuth } from "@/lib/AuthContext"
import { cn, formatDate } from "@/lib/utils"
import { getDeckColorClass, getDeckColorStyle } from "@/lib/decks"
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
import { Input } from "@/components/ui/input"
import {
  AlertCircle,
  Calendar,
  Globe,
  Link as LinkIcon,
  User,
  Settings,
  Layers,
  Plus,
  Lock,
  EyeOff,
  Folder as FolderIcon,
  Search,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useProfile, useProfileItems } from "@/hooks/useProfile"
import { useCustomTheme } from "@/components/theme/custom-theme-provider"

export default function ProfilePage() {
  const t = useTranslations("Profile")
  const params = useParams<{ username: string }>()
  const username = params.username

  const { user: currentUser } = useAuth()
  const { deckDisplayMode } = useCustomTheme()
  const isLineMode = deckDisplayMode === 'line'

  const {
    data: profileUser,
    isLoading: profileLoading,
    error,
  } = useProfile(username)
  const { data: items = [], isLoading: itemsLoading } = useProfileItems(
    profileUser?.id
  )

  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const folders = filteredItems.filter((item) => item.type === "folder")
  const decks = filteredItems.filter((item) => item.type !== "folder")

  const loading = profileLoading || (!!profileUser && itemsLoading)

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8 sm:px-10 sm:py-16 space-y-8">
        <div className="flex items-center gap-3 mb-8">
          <Skeleton className="h-11 w-11 rounded-2xl" />
          <Skeleton className="h-9 w-48 rounded-xl" />
        </div>
        <Card className="rounded-3xl border-border/80 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-24 w-24 rounded-[calc(var(--radius)*2.2)]" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-[200px] rounded-lg" />
                <Skeleton className="h-4 w-[140px] rounded-lg" />
              </div>
            </div>
          </div>
          <Skeleton className="h-16 w-full rounded-2xl" />
        </Card>
      </div>
    )
  }

  if (error || !profileUser || profileUser.is_guest) {
    return (
      <div className="container mx-auto max-w-xl px-4 py-16 text-center">
        <Card className="rounded-3xl border-border/80 p-8 sm:p-12 shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h2 className="mb-2 text-2xl font-bold tracking-tight">
            {t("userNotFound")}
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">
            {t("userNotFoundDesc")}
          </p>
          <Link href="/">
            <Button variant="outline" className="rounded-xl font-medium">
              {t("goHome")}
            </Button>
          </Link>
        </Card>
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

  const socialEntries = profileUser.social_links
    ? Object.entries(profileUser.social_links).filter(([, url]) => url && url.trim())
    : []

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 sm:px-10 sm:py-16 space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 min-w-0">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="p-2.5 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-sm shrink-0">
            <User className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate min-w-0">{profileUser.username}</h1>
        </div>

        {isOwnProfile && (
          <Link href="/settings" className="hidden sm:block shrink-0">
            <Button
              variant="outline"
              className="rounded-xl gap-2 font-medium border-border/80 hover:bg-accent hover:text-accent-foreground transition-all shadow-sm"
            >
              <Settings className="w-4 h-4 text-primary" />
              {t("editProfile")}
            </Button>
          </Link>
        )}
      </div>

      {/* Main Profile Info Card (Banner-less) */}
      <Card className="rounded-3xl border-border/80 shadow-md bg-card overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 min-w-0">
            <div className="flex flex-row items-center gap-4 sm:gap-5 min-w-0 flex-1">
              <Avatar className="h-20 w-20 sm:h-28 sm:w-28 rounded-[calc(var(--radius)*2.2)] border-2 border-primary/20 bg-muted shadow-sm shrink-0">
                {profileUser.avatar_url ? (
                  <AvatarImage
                    src={profileUser.avatar_url}
                    alt={profileUser.display_name}
                    className="object-cover"
                  />
                ) : (
                  <AvatarFallback className="text-2xl sm:text-4xl font-bold bg-primary/10 text-primary rounded-[calc(var(--radius)*2.2)]">
                    {profileUser.display_name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>

              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap min-w-0">
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight truncate max-w-full">
                    {profileUser.display_name}
                  </h2>
                </div>
                <div className="flex items-center gap-x-5 gap-y-1.5 flex-wrap text-xs text-muted-foreground pt-0.5">
                  <span className="font-mono text-xs sm:text-sm text-muted-foreground truncate max-w-full">
                    @{profileUser.username}
                  </span>
                  {profileUser.created_at && (
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground/90">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
                      <span>{t("joined", { date: formatDate(profileUser.created_at) })}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Social Media Buttons */}
            {socialEntries.length > 0 && (
              <div
                className={cn(
                  "w-full sm:w-auto shrink-0 flex flex-wrap items-center gap-2",
                  socialEntries.length > 4
                    ? "sm:grid sm:grid-rows-2 sm:grid-flow-col"
                    : "sm:flex sm:flex-nowrap sm:flex-row"
                )}
              >
                {socialEntries.map(([key, url]) => (
                  <a
                    key={key}
                    href={url.startsWith("http") ? url : `https://${url}`}
                    target="_blank"
                    rel="noreferrer"
                    title={key === "twitter" ? "X (Twitter)" : key}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl gap-2 h-9 px-3 border-border/70 hover:bg-accent hover:text-primary hover:border-primary/40 transition-all font-medium text-xs flex items-center justify-center"
                    >
                      <span className="text-primary shrink-0">{renderSocialIcon(key)}</span>
                      <span className="capitalize">
                        {key === "twitter" ? "X" : key}
                      </span>
                    </Button>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Bio Section below horizontal line */}
          {profileUser.bio && (
            <div className="mt-6 pt-6 border-t border-border/60 min-w-0">
              <p className="text-base text-foreground/90 leading-relaxed font-normal whitespace-pre-wrap break-words [overflow-wrap:anywhere] min-w-0">
                {profileUser.bio}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Decks & Folders Section */}
      <div className="space-y-5">
        <div className="relative flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-sm">
              <Layers className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">{t("decks")}</h2>
            <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-xs font-semibold">
              {decks.length}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={isSearchOpen ? "secondary" : "ghost"}
              size="icon"
              onClick={() => {
                if (isSearchOpen) setSearchQuery("")
                setIsSearchOpen(!isSearchOpen)
              }}
              className={cn(
                "h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors",
                isSearchOpen ? "text-primary sm:hidden" : "text-muted-foreground"
              )}
            >
              <Search className="h-5 w-5" />
            </Button>
            
            {isSearchOpen && (
              <div className="absolute right-0 top-12 z-20 flex items-center sm:static sm:top-auto sm:z-auto">
                <Input
                  autoFocus
                  placeholder={t("searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-[240px] sm:w-48 md:w-64 pr-8 rounded-xl h-10 border-border bg-card/95 backdrop-blur-md shadow-lg sm:bg-card/50 sm:shadow-sm sm:backdrop-blur-none"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-transparent rounded-xl"
                  onClick={() => {
                    setSearchQuery("")
                    setIsSearchOpen(false)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <Card className="rounded-3xl border-2 border-dashed border-border/80 p-8 sm:p-12 text-center bg-card/40">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Layers className="w-6 h-6" />
            </div>
            <p className="text-lg font-semibold text-foreground mb-1">
              {searchQuery ? t("noMatchesTitle") : t("noDecksTitle")}
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              {searchQuery
                ? t("noMatchesDesc", { query: searchQuery })
                : isOwnProfile
                ? t("noDecksOwn")
                : t("noDecksOther")}
            </p>
            {isOwnProfile && !searchQuery && (
              <Link href="/decks?new=true">
                <Button className="rounded-xl gap-2 font-medium">
                  <Plus className="w-4 h-4" />
                  {t("createFirstDeck")}
                </Button>
              </Link>
            )}
          </Card>
        ) : (
          <>
            {folders.length > 0 && (
              <div className={cn(isLineMode ? "flex flex-col gap-2" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pr-2 pb-2")}>
                {folders.map((folder) => (
                  <Link
                    href={`/${profileUser.username}/${folder.slug}`}
                    key={folder.id}
                    className={cn("block", isLineMode ? "group" : "group/folder")}
                  >
                    {isLineMode ? (
                      <Card
                        className={cn(
                          "relative w-full rounded-2xl border border-border/70 px-3.5 py-2 sm:px-4 sm:py-2.5 transition-all duration-200 group-hover:border-primary/50 group-hover:shadow-sm flex !flex-row flex-row items-center justify-between gap-2.5 sm:gap-3 overflow-hidden bg-card min-h-[46px] sm:min-h-[50px]",
                          getDeckColorClass(folder.properties?.color, 'left')
                        )}
                        style={getDeckColorStyle(folder.properties?.color, 'left')}
                      >
                        {/* Left section: Badge + Title + Description */}
                        <div className="relative z-10 flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1 pointer-events-none">
                          <Badge
                            variant="secondary"
                            className="shrink-0 text-[11px] px-1.5 py-0 h-5 font-semibold"
                          >
                            <FolderIcon className="w-3 h-3 mr-1" />
                            <span>{folder.decks_count ?? 0}</span>
                          </Badge>

                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="font-bold text-xs sm:text-sm tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-2 sm:truncate sm:line-clamp-none break-words [overflow-wrap:anywhere] leading-snug sm:leading-normal">
                              {folder.name}
                            </span>
                            {folder.properties?.description && (
                              <span className="hidden md:inline-block text-xs text-muted-foreground truncate shrink min-w-0">
                                • {folder.properties.description}
                              </span>
                            )}
                          </div>
                        </div>

                        {isOwnProfile && (
                          <div className="relative z-20 flex items-center text-muted-foreground/70 shrink-0 pointer-events-none">
                            {folder.privacy === "private" && <Lock className="w-3.5 h-3.5" />}
                            {folder.privacy === "unlisted" && <EyeOff className="w-3.5 h-3.5" />}
                            {folder.privacy === "public" && <Globe className="w-3.5 h-3.5" />}
                          </div>
                        )}
                      </Card>
                    ) : (
                      <div className="relative w-full h-[130px]">
                        {/* Stacked card 2 (back) */}
                        <div className="absolute inset-0 rounded-2xl border border-border/40 bg-card/40 translate-x-2 translate-y-2 transition-transform duration-300 group-hover/folder:translate-x-3 group-hover/folder:translate-y-3 z-0" />
                        {/* Stacked card 1 (middle) */}
                        <div className="absolute inset-0 rounded-2xl border border-border/50 bg-card/60 translate-x-1 translate-y-1 transition-transform duration-300 group-hover/folder:translate-x-1.5 group-hover/folder:translate-y-1.5 z-0" />
                        
                        {/* Actual folder card */}
                        <Card
                          className={cn(
                            "absolute inset-0 rounded-2xl border border-border/70 p-4 sm:p-5 overflow-hidden transition-all duration-300 group-hover/folder:-translate-y-1 group-hover/folder:-translate-x-1 group-hover/folder:shadow-lg group-hover/folder:border-primary/50 flex flex-col justify-between z-10 bg-card",
                            getDeckColorClass(folder.properties?.color)
                          )}
                        >
                          {folder.properties?.cover_image_url && (
                            <div 
                              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover/folder:scale-105" 
                              style={{ backgroundImage: `url(${folder.properties.cover_image_url})` }}
                            />
                          )}
                          <div className={cn(
                            "relative z-10 flex flex-col h-full min-w-0",
                            folder.properties?.cover_image_url ? "text-white" : ""
                          )}>
                            <CardHeader className="p-0 flex-1 flex flex-col min-h-0 min-w-0 relative pr-6">
                              <CardTitle className={cn(
                                "flex items-start text-base font-bold tracking-tight mb-1.5 transition-colors break-words min-w-0",
                                folder.properties?.cover_image_url ? "text-white group-hover/folder:text-white/90 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-xl self-start max-w-full" : "group-hover/folder:text-primary"
                              )}>
                                <Badge 
                                  variant={folder.properties?.cover_image_url ? "outline" : "secondary"}
                                  className={cn(
                                    "mr-1.5 mt-0.5 pointer-events-none shrink-0 px-1.5 py-0 h-5 text-[11px]",
                                    folder.properties?.cover_image_url ? "border-white/30 text-white/90" : ""
                                  )}
                                >
                                  <FolderIcon className="w-3 h-3 mr-1" />
                                  <span>{folder.decks_count ?? 0}</span>
                                </Badge>
                                <span className="leading-snug break-all line-clamp-2">{folder.name}</span>
                              </CardTitle>
                              {folder.properties?.description && !folder.properties?.cover_image_url && (
                                <CardDescription className="text-xs leading-snug break-all line-clamp-1 text-muted-foreground">
                                  {folder.properties.description}
                                </CardDescription>
                              )}
                            </CardHeader>
                          </div>
                          {isOwnProfile && (
                            <div className={cn(
                              "absolute bottom-3.5 right-4 sm:right-5 z-20 transition-colors",
                              folder.properties?.cover_image_url ? "text-white/60 group-hover/folder:text-white/90" : "text-muted-foreground/60 group-hover/folder:text-muted-foreground"
                            )}>
                              {folder.privacy === "private" && <Lock className="w-4 h-4" />}
                              {folder.privacy === "unlisted" && <EyeOff className="w-4 h-4" />}
                              {folder.privacy === "public" && <Globe className="w-4 h-4" />}
                            </div>
                          )}
                        </Card>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}

            {/* Separator if both folders and decks exist */}
            {folders.length > 0 && decks.length > 0 && (
              <hr className="border-border/60 my-6" />
            )}
            {decks.length > 0 && (
              <div className={cn(isLineMode ? "flex flex-col gap-2" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4")}>
                {decks.map((deck) => (
                  <Link
                    href={`/${profileUser.username}/${deck.slug}`}
                    key={deck.id}
                    className="block group"
                  >
                    {isLineMode ? (
                      <Card
                        className={cn(
                          "relative w-full rounded-2xl border border-border/70 px-3.5 py-2 sm:px-4 sm:py-2.5 transition-all duration-200 group-hover:border-primary/50 group-hover:shadow-sm flex !flex-row flex-row items-center justify-between gap-2.5 sm:gap-3 overflow-hidden bg-card min-h-[46px] sm:min-h-[50px]",
                          getDeckColorClass(deck.properties?.color, 'left')
                        )}
                        style={getDeckColorStyle(deck.properties?.color, 'left')}
                      >
                        {/* Left section: Badge + Title + Description */}
                        <div className="relative z-10 flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1 pointer-events-none">
                          {deck.cards_count !== undefined && (
                            <Badge
                              variant="secondary"
                              className="shrink-0 text-[11px] px-1.5 py-0 h-5 font-semibold"
                            >
                              {deck.cards_count}
                            </Badge>
                          )}

                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="font-bold text-xs sm:text-sm tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-2 sm:truncate sm:line-clamp-none break-words [overflow-wrap:anywhere] leading-snug sm:leading-normal">
                              {deck.name}
                            </span>
                            {deck.properties?.description && (
                              <span className="hidden md:inline-block text-xs text-muted-foreground truncate shrink min-w-0">
                                • {deck.properties.description}
                              </span>
                            )}
                          </div>
                        </div>

                        {isOwnProfile && (
                          <div className="relative z-20 flex items-center text-muted-foreground/70 shrink-0 pointer-events-none">
                            {deck.privacy === "private" && <Lock className="w-3.5 h-3.5" />}
                            {deck.privacy === "unlisted" && <EyeOff className="w-3.5 h-3.5" />}
                            {deck.privacy === "public" && <Globe className="w-3.5 h-3.5" />}
                          </div>
                        )}
                      </Card>
                    ) : (
                      <Card
                        className={cn(
                          "relative w-full h-[130px] rounded-2xl border border-border/70 p-4 sm:p-5 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/50 flex flex-col justify-between",
                          getDeckColorClass(deck.properties?.color)
                        )}
                      >
                        {deck.properties?.cover_image_url && (
                          <div 
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" 
                            style={{ backgroundImage: `url(${deck.properties.cover_image_url})` }}
                          />
                        )}
                        <div className={cn(
                          "relative z-10 flex flex-col h-full min-w-0",
                          deck.properties?.cover_image_url ? "text-white" : ""
                        )}>
                          <CardHeader className="p-0 flex-1 flex flex-col min-h-0 min-w-0 relative pr-6">
                            <CardTitle className={cn(
                              "flex items-start text-base font-bold tracking-tight mb-1.5 transition-colors break-words min-w-0",
                              deck.properties?.cover_image_url ? "text-white group-hover:text-white/90 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-xl self-start max-w-full" : "group-hover:text-primary"
                            )}>
                              {deck.cards_count !== undefined && (
                                <Badge 
                                  variant={deck.properties?.cover_image_url ? "outline" : "secondary"}
                                  className={cn(
                                    "mr-1.5 mt-0.5 pointer-events-none shrink-0 text-[11px] px-1.5 py-0 h-5",
                                    deck.properties?.cover_image_url ? "border-white/30 text-white/90" : ""
                                  )}
                                >
                                  {deck.cards_count}
                                </Badge>
                              )}
                              <span className="leading-snug break-all line-clamp-2">{deck.name}</span>
                            </CardTitle>
                            {deck.properties?.description && !deck.properties?.cover_image_url && (
                              <CardDescription className="text-xs leading-snug break-all line-clamp-1 text-muted-foreground">
                                {deck.properties.description}
                              </CardDescription>
                            )}
                          </CardHeader>
                        </div>
                        {isOwnProfile && (
                          <div className={cn(
                            "absolute bottom-3.5 right-4 sm:right-5 z-20 transition-colors",
                            deck.properties?.cover_image_url ? "text-white/60 group-hover:text-white/90" : "text-muted-foreground/60 group-hover:text-muted-foreground"
                          )}>
                            {deck.privacy === "private" && <Lock className="w-4 h-4" />}
                            {deck.privacy === "unlisted" && <EyeOff className="w-4 h-4" />}
                            {deck.privacy === "public" && <Globe className="w-4 h-4" />}
                          </div>
                        )}
                      </Card>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
