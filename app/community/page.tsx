"use client"

import React, { useState } from "react"
import { useTranslations } from "next-intl"
import {
  Globe,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Layers,
  Folder as FolderIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  CommunityModeButtons,
  CommunitySortMode,
} from "@/components/community/CommunityModeButtons"
import { CommunityDeckCard } from "@/components/community/CommunityDeckCard"
import { CommunityFolderCard } from "@/components/community/CommunityFolderCard"
import { useCommunityItems } from "@/hooks/useCommunity"
import { useCustomTheme } from "@/components/theme/custom-theme-provider"

export default function CommunityPage() {
  const t = useTranslations("Community")
  const tCommon = useTranslations("Common")
  const { deckDisplayMode } = useCustomTheme()
  const isLineMode = deckDisplayMode === "line"
  const [mode, setMode] = useState<CommunitySortMode>("popular")
  const [itemType, setItemType] = useState<"all" | "deck" | "folder">("all")
  const [searchInput, setSearchInput] = useState("")
  const [submittedQuery, setSubmittedQuery] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 18

  const handleSelectMode = (newMode: CommunitySortMode) => {
    setMode(newMode)
    setPage(1)
    if (newMode !== "search") {
      setSearchInput("")
      setSubmittedQuery("")
    }
  }

  const handleItemTypeChange = (newType: "all" | "deck" | "folder") => {
    setItemType(newType)
    setPage(1)
  }

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setSubmittedQuery(searchInput.trim())
    setPage(1)
  }

  const handleClearSearch = () => {
    setSearchInput("")
    setSubmittedQuery("")
    setPage(1)
  }

  const { data, isLoading, isError, error } = useCommunityItems({
    item_type: mode === "search" ? "all" : itemType,
    sort: mode,
    q: mode === "search" ? submittedQuery : undefined,
    page,
    limit: pageSize,
  })

  const items = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = data?.total_pages ?? 1

  return (
    <div className="container mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-10 sm:py-16">
      {/* Page Title Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex shrink-0 items-center justify-center rounded-2xl bg-primary/10 p-2.5 text-primary shadow-sm">
            <Globe className="h-6 w-6" />
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {t("title")}
            </h1>
            {!isLoading && (
              <Badge
                variant="secondary"
                className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
              >
                {total}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Top 4 Mode Buttons */}
      <CommunityModeButtons
        currentMode={mode}
        onSelectMode={handleSelectMode}
      />

      {/* Search / Filter Row */}
      {mode === "search" ? (
        /* Search Form with explicit Search button */
        <form
          onSubmit={handleSearchSubmit}
          className="flex items-center gap-2 rounded-2xl border border-border/70 bg-card p-2 shadow-sm"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="h-10 rounded-xl border-border bg-background/80 pr-8 pl-9 text-sm focus-visible:ring-primary/40"
              autoFocus
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground hover:text-foreground focus:outline-none"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <Button
            type="submit"
            className="h-10 shrink-0 gap-1.5 rounded-xl px-3 font-semibold sm:px-5"
            aria-label={t("searchButton")}
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">{t("searchButton")}</span>
          </Button>
        </form>
      ) : (
        /* Item Type Filter Tabs */
        <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-card p-2 shadow-sm">
          <div className="flex items-center gap-1 rounded-xl bg-muted/60 p-1">
            <button
              type="button"
              onClick={() => handleItemTypeChange("all")}
              className={cn(
                "cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150",
                itemType === "all"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t("allItems")}
            </button>
            <button
              type="button"
              onClick={() => handleItemTypeChange("deck")}
              className={cn(
                "flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150",
                itemType === "deck"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>{t("decks")}</span>
            </button>
            <button
              type="button"
              onClick={() => handleItemTypeChange("folder")}
              className={cn(
                "flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150",
                itemType === "folder"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <FolderIcon className="h-3.5 w-3.5" />
              <span>{t("folders")}</span>
            </button>
          </div>
        </div>
      )}

      {/* Content Area */}
      {isLoading ? (
        <div
          className={cn(
            isLineMode
              ? "flex flex-col gap-2"
              : "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          )}
        >
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton
              key={i}
              className={cn(
                isLineMode ? "h-12 rounded-2xl" : "h-[130px] rounded-2xl"
              )}
            />
          ))}
        </div>
      ) : isError ? (
        <Card className="rounded-3xl border-border/80 bg-card/60 p-8 text-center">
          <p className="text-sm text-destructive">
            {error?.message || t("failed")}
          </p>
        </Card>
      ) : items.length === 0 ? (
        <Card className="rounded-3xl border-2 border-dashed border-border/80 bg-card/40 p-10 text-center sm:p-14">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            {mode === "search" ? (
              <Search className="h-6 w-6" />
            ) : (
              <Globe className="h-6 w-6" />
            )}
          </div>
          <p className="mb-1 text-lg font-semibold text-foreground">
            {mode === "search" && submittedQuery
              ? t("noMatchesTitle")
              : mode === "search"
                ? t("startSearchingTitle")
                : t("noItemsTitle")}
          </p>
          <p className="mx-auto max-w-md text-sm text-muted-foreground">
            {mode === "search" && submittedQuery
              ? t("noMatchesDesc", { query: submittedQuery })
              : mode === "search"
                ? t("startSearchingDesc")
                : t("noItemsDesc")}
          </p>
          {mode === "search" && submittedQuery && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearSearch}
              className="mt-5 rounded-xl"
            >
              {t("clearSearch")}
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Mixed items grid */}
          <div
            className={cn(
              isLineMode
                ? "flex flex-col gap-2"
                : "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            )}
          >
            {items.map((item) =>
              item.type === "folder" ? (
                <CommunityFolderCard key={`folder-${item.id}`} folder={item} />
              ) : (
                <CommunityDeckCard key={`deck-${item.id}`} deck={item} />
              )
            )}
          </div>

          {/* Pagination Navigation Bar */}
          {totalPages > 1 && (
            <div className="flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 sm:flex-row">
              <span className="text-xs text-muted-foreground">
                {t.rich("showingPage", {
                  page,
                  totalPages,
                  items: total,
                  bold: (chunks) => (
                    <span className="font-semibold text-foreground">
                      {chunks}
                    </span>
                  ),
                })}
              </span>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page <= 1}
                  className="h-8 gap-1 rounded-xl px-2.5 text-xs font-medium"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">
                    {tCommon("previous")}
                  </span>
                </Button>

                {/* Page Number Buttons */}
                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                    .filter((p) => {
                      if (totalPages <= 7) return true
                      return (
                        p === 1 || p === totalPages || Math.abs(p - page) <= 1
                      )
                    })
                    .map((p, idx, arr) => {
                      const prev = arr[idx - 1]
                      const showEllipsis = prev && p - prev > 1

                      return (
                        <React.Fragment key={p}>
                          {showEllipsis && (
                            <span className="px-1 text-xs text-muted-foreground">
                              ...
                            </span>
                          )}
                          <Button
                            variant={page === p ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setPage(p)}
                            className={cn(
                              "h-8 w-8 rounded-xl p-0 text-xs font-semibold",
                              page === p
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            {p}
                          </Button>
                        </React.Fragment>
                      )
                    })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={page >= totalPages}
                  className="h-8 gap-1 rounded-xl px-2.5 text-xs font-medium"
                >
                  <span className="hidden sm:inline">{tCommon("next")}</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
