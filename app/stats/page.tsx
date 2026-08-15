"use client"

import React from "react"
import Link from "next/link"
import { useAuth } from "@/lib/AuthContext"
import { useUserItems } from "@/hooks/useFolders"
import { useSRSCounts } from "@/hooks/useSRSCounts"
import { Deck } from "@/types"
import {
  BarChart3,
  BookOpen,
  Brain,
  Clock,
  Layers,
  Sparkles,
  Zap,
  LogIn,
  UserPlus,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

import { useUserActivity } from "@/hooks/useActivity"
import { ActivityGraph } from "@/components/ActivityGraph"

export default function StatisticsPage() {
  const { user, loading: authLoading } = useAuth()
  const { data: items = [], isLoading: itemsLoading } = useUserItems()
  const { data: srsCountsData = {}, isLoading: srsLoading } = useSRSCounts()
  const { data: activitySummary, isLoading: activityLoading } =
    useUserActivity()

  const loading =
    authLoading ||
    (!!user &&
      !user.is_guest &&
      (itemsLoading || srsLoading || activityLoading))

  const isGuestOrUnauthenticated = !authLoading && (!user || user.is_guest)

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-10 sm:py-16">
        <div className="mb-8 flex items-center gap-3">
          <Skeleton className="h-11 w-11 rounded-2xl" />
          <Skeleton className="h-9 w-48 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    )
  }

  if (isGuestOrUnauthenticated) {
    return (
      <div className="container mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-10 sm:py-16">
        <div className="flex items-center gap-3">
          <div className="flex shrink-0 items-center justify-center rounded-2xl bg-primary/10 p-2.5 text-primary shadow-sm">
            <BarChart3 className="h-6 w-6" />
          </div>
          <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
            Study Statistics
          </h1>
        </div>

        <Card className="space-y-6 rounded-3xl border-border/80 p-8 text-center shadow-sm sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
            <BarChart3 className="h-8 w-8" />
          </div>
          <div className="mx-auto max-w-lg space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">
              Study Statistics & Analytics
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              Track your learning velocity, SRS recall rates, deck mastery, and
              daily study streaks with a registered account.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link href="/login">
              <Button className="gap-2 rounded-xl px-6 font-medium">
                <LogIn className="h-4 w-4" />
                Log In
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                variant="outline"
                className="gap-2 rounded-xl border-border/80 px-6 font-medium"
              >
                <UserPlus className="h-4 w-4 text-primary" />
                Create Free Account
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  // Calculate statistics for logged-in actual user
  const userDecks = items.filter((item): item is Deck => item.type === "deck")
  const totalDecks = userDecks.length

  let totalNewCards = 0
  let totalLearningCards = 0
  let totalReviewCards = 0

  userDecks.forEach((deck) => {
    const srs = srsCountsData[deck.id]
    if (srs?.activated) {
      totalNewCards += srs.new_count || 0
      totalLearningCards += srs.learning_count || 0
      totalReviewCards += srs.review_count || 0
    }
  })

  const totalDue = totalLearningCards + totalReviewCards
  const totalActiveSRSCards =
    totalNewCards + totalLearningCards + totalReviewCards

  const pendingSrsDecks = userDecks.filter((deck) => {
    const srs = srsCountsData[deck.id]
    if (!srs?.activated) return false
    const pendingCount =
      (srs.new_count || 0) +
      (srs.learning_count || 0) +
      (srs.review_count || 0)
    return pendingCount > 0
  })

  return (
    <div className="container mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-10 sm:py-16">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex shrink-0 items-center justify-center rounded-2xl bg-primary/10 p-2.5 text-primary shadow-sm">
            <BarChart3 className="h-6 w-6" />
          </div>
          <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
            Study Statistics
          </h1>
        </div>

        <Link href="/decks" className="hidden sm:block">
          <Button
            variant="outline"
            className="gap-2 rounded-xl border-border/80 font-medium"
            size="sm"
          >
            <BookOpen className="h-4 w-4" />
            <span>Study Decks</span>
          </Button>
        </Link>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="relative space-y-3 overflow-hidden rounded-2xl border-border/80 bg-card p-5 shadow-sm transition-all hover:border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Total Decks
            </span>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 dark:bg-blue-500/20">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight">
              {totalDecks}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Decks in your collection
            </p>
          </div>
        </Card>

        <Card className="relative space-y-3 overflow-hidden rounded-2xl border-border/80 bg-card p-5 shadow-sm transition-all hover:border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Due for Review
            </span>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 dark:bg-amber-500/20">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight">{totalDue}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              {totalLearningCards} learning, {totalReviewCards} review
            </p>
          </div>
        </Card>

        <Card className="relative space-y-3 overflow-hidden rounded-2xl border-border/80 bg-card p-5 shadow-sm transition-all hover:border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              New Cards
            </span>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight">
              {totalNewCards}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Ready to introduce into SRS
            </p>
          </div>
        </Card>

        <Card className="relative space-y-3 overflow-hidden rounded-2xl border-border/80 bg-card p-5 shadow-sm transition-all hover:border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              SRS Active
            </span>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500 dark:bg-purple-500/20">
              <Brain className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight">
              {totalActiveSRSCards}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Cards tracked in SRS system
            </p>
          </div>
        </Card>
      </div>

      {/* GitHub-like Learning Activity Graph */}
      <ActivityGraph summary={activitySummary} isLoading={activityLoading} />

      {/* Deck Statistics Breakdown Table / Cards */}
      <Card className="flex flex-col gap-4 overflow-hidden rounded-3xl border-border/80 bg-card p-5 shadow-sm sm:gap-5 sm:p-6">
        <CardHeader className="p-0">
          <div>
            <CardTitle className="flex items-center gap-2.5 text-xl font-bold tracking-tight">
              <Zap className="h-5 w-5 text-primary" />
              Deck SRS Breakdown
            </CardTitle>
            <CardDescription className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Memory review queues for decks with SRS cards pending
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {pendingSrsDecks.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <BookOpen className="mx-auto mb-3 h-10 w-10 opacity-40" />
              <p className="text-base font-medium text-foreground">
                No pending SRS cards
              </p>
              <p className="mt-1 text-sm">
                {userDecks.length === 0
                  ? "Create a deck to start collecting study statistics."
                  : "You're all caught up! Decks with cards pending review will appear here."}
              </p>
              <Link href="/decks" className="mt-4 inline-block">
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 rounded-xl border-border/80 font-medium"
                >
                  {userDecks.length === 0 ? "Create Deck" : "View Decks"}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingSrsDecks.map((deck) => {
                const srs = srsCountsData[deck.id] || {
                  new_count: 0,
                  learning_count: 0,
                  review_count: 0,
                }
                const deckDue =
                  (srs.learning_count || 0) + (srs.review_count || 0)
                const totalDeckSrs =
                  (srs.new_count || 0) +
                  (srs.learning_count || 0) +
                  (srs.review_count || 0)
                const deckHref = user?.username
                  ? `/${user.username}/${deck.slug}`
                  : `/decks/${deck.id}`

                return (
                  <div
                    key={deck.id}
                    className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-4 transition-all hover:border-primary/50 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={deckHref}
                          className="truncate font-bold text-foreground transition-colors hover:text-primary"
                        >
                          {deck.name}
                        </Link>
                        <Badge
                          variant="secondary"
                          className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                        >
                          {totalDeckSrs} SRS cards
                        </Badge>
                      </div>
                      {deck.properties?.description && (
                        <p className="line-clamp-2 break-all text-xs text-muted-foreground">
                          {deck.properties.description}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 sm:flex-nowrap sm:justify-end">
                      <div className="flex items-center gap-1.5 text-xs font-medium">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-blue-500/10 px-2.5 py-1 font-semibold text-blue-600 dark:text-blue-400">
                          {srs.new_count || 0} New
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500/10 px-2.5 py-1 font-semibold text-amber-600 dark:text-amber-400">
                          {srs.learning_count || 0} Learn
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2.5 py-1 font-semibold text-emerald-600 dark:text-emerald-400">
                          {srs.review_count || 0} Review
                        </span>
                      </div>

                      <Link href={deckHref}>
                        <Button
                          size="sm"
                          variant={deckDue > 0 ? "default" : "outline"}
                          className="shrink-0 rounded-xl px-4 text-xs font-medium"
                        >
                          {deckDue > 0 ? `Study (${deckDue})` : "View Deck"}
                        </Button>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
