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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

export default function StatisticsPage() {
  const { user, loading: authLoading } = useAuth()
  const { data: items = [], isLoading: itemsLoading } = useUserItems()
  const { data: srsCountsData = {}, isLoading: srsLoading } = useSRSCounts()

  const loading = authLoading || (!!user && !user.is_guest && (itemsLoading || srsLoading))

  const isGuestOrUnauthenticated = !authLoading && (!user || user.is_guest)

  if (loading) {
    return (
      <div className="container mx-auto max-w-5xl space-y-8 px-4 py-12">
        <div className="space-y-3">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    )
  }

  if (isGuestOrUnauthenticated) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-20 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary shadow-inner">
          <BarChart3 className="h-10 w-10" />
        </div>
        <h1 className="mb-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Study Statistics & Analytics
        </h1>
        <p className="mx-auto mb-8 max-w-lg text-lg text-muted-foreground">
          Track your learning velocity, SRS recall rates, deck mastery, and daily study streaks with a registered account.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/login">
            <Button size="lg" className="gap-2 rounded-full px-6 shadow-md">
              <LogIn className="h-4 w-4" />
              Log In
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="lg" variant="outline" className="gap-2 rounded-full px-6">
              <UserPlus className="h-4 w-4 text-primary" />
              Create Free Account
            </Button>
          </Link>
        </div>
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
    const srs = srsCountsData[deck.id] || { new_count: 0, learning_count: 0, review_count: 0 }
    totalNewCards += srs.new_count || 0
    totalLearningCards += srs.learning_count || 0
    totalReviewCards += srs.review_count || 0
  })

  const totalDue = totalLearningCards + totalReviewCards
  const totalActiveSRSCards = totalNewCards + totalLearningCards + totalReviewCards

  return (
    <div className="container mx-auto max-w-5xl space-y-10 px-4 py-10">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Study Statistics</h1>
          </div>
          <p className="mt-1 text-muted-foreground">
            Overview of your flashcard collections, SRS review queues, and learning performance.
          </p>
        </div>

        <Link href="/decks">
          <Button variant="outline" className="gap-2 rounded-full">
            <BookOpen className="h-4 w-4" />
            Study Decks
          </Button>
        </Link>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden border-border/60 bg-gradient-to-br from-background via-background to-muted/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Decks</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 dark:bg-blue-500/20">
              <Layers className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalDecks}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Decks in your collection
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border/60 bg-gradient-to-br from-background via-background to-muted/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Due for Review</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 dark:bg-amber-500/20">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalDue}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              {totalLearningCards} learning, {totalReviewCards} review
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border/60 bg-gradient-to-br from-background via-background to-muted/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">New Cards</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20">
              <Sparkles className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalNewCards}</div>
            <p className="mt-1 text-xs text-muted-foreground">Ready to introduce into SRS</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border/60 bg-gradient-to-br from-background via-background to-muted/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">SRS Active Cards</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500 dark:bg-purple-500/20">
              <Brain className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalActiveSRSCards}</div>
            <p className="mt-1 text-xs text-muted-foreground">Cards tracked in SRS system</p>
          </CardContent>
        </Card>
      </div>

      {/* Deck Statistics Breakdown Table / Cards */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <Zap className="h-5 w-5 text-amber-500" />
            Deck SRS Breakdown
          </CardTitle>
          <CardDescription>
            Detailed view of memory review queues per deck
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userDecks.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <BookOpen className="mx-auto mb-3 h-10 w-10 opacity-40" />
              <p className="text-base font-medium">No decks found</p>
              <p className="text-sm">Create a deck to start collecting study statistics.</p>
              <Link href="/decks" className="mt-4 inline-block">
                <Button variant="outline" size="sm" className="mt-2 rounded-full">
                  Create Deck
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {userDecks.map((deck) => {
                const srs = srsCountsData[deck.id] || { new_count: 0, learning_count: 0, review_count: 0 }
                const deckDue = (srs.learning_count || 0) + (srs.review_count || 0)
                const totalDeckSrs = (srs.new_count || 0) + (srs.learning_count || 0) + (srs.review_count || 0)

                return (
                  <div
                    key={deck.id}
                    className="flex flex-col gap-4 rounded-xl border border-border/50 bg-card p-4 transition-all hover:border-border sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/decks/${deck.id}`}
                          className="font-semibold text-foreground hover:underline"
                        >
                          {deck.name}
                        </Link>
                        <Badge variant="outline" className="text-xs">
                          {totalDeckSrs} SRS cards
                        </Badge>
                      </div>
                      {deck.properties?.description && (
                        <p className="line-clamp-1 text-xs text-muted-foreground">
                          {deck.properties.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-1 font-medium text-blue-600 dark:text-blue-400">
                          {srs.new_count || 0} New
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 font-medium text-amber-600 dark:text-amber-400">
                          {srs.learning_count || 0} Learn
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 font-medium text-emerald-600 dark:text-emerald-400">
                          {srs.review_count || 0} Review
                        </span>
                      </div>

                      <Link href={`/decks/${deck.id}`}>
                        <Button
                          size="sm"
                          variant={deckDue > 0 ? "default" : "outline"}
                          className="rounded-full px-4 text-xs"
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
