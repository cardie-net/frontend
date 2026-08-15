'use client'

import React, { useState } from 'react'
import {
  Globe,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Layers,
  Folder as FolderIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  CommunityModeButtons,
  CommunitySortMode,
} from '@/components/community/CommunityModeButtons'
import { CommunityDeckCard } from '@/components/community/CommunityDeckCard'
import { CommunityFolderCard } from '@/components/community/CommunityFolderCard'
import { useCommunityItems } from '@/hooks/useCommunity'

export default function CommunityPage() {
  const [mode, setMode] = useState<CommunitySortMode>('popular')
  const [itemType, setItemType] = useState<'all' | 'deck' | 'folder'>('all')
  const [searchInput, setSearchInput] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 18

  const handleSelectMode = (newMode: CommunitySortMode) => {
    setMode(newMode)
    setPage(1)
    if (newMode !== 'search') {
      setSearchInput('')
      setSubmittedQuery('')
    }
  }

  const handleItemTypeChange = (newType: 'all' | 'deck' | 'folder') => {
    setItemType(newType)
    setPage(1)
  }

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setSubmittedQuery(searchInput.trim())
    setPage(1)
  }

  const handleClearSearch = () => {
    setSearchInput('')
    setSubmittedQuery('')
    setPage(1)
  }

  const { data, isLoading, isError, error } = useCommunityItems({
    item_type: mode === 'search' ? 'all' : itemType,
    sort: mode,
    q: mode === 'search' ? submittedQuery : undefined,
    page,
    limit: pageSize,
  })

  const items = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = data?.total_pages ?? 1

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 sm:px-10 sm:py-16 space-y-8">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-sm shrink-0">
            <Globe className="w-6 h-6" />
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Community
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
      {mode === 'search' ? (
        /* Search Form with explicit Search button */
        <form
          onSubmit={handleSearchSubmit}
          className="flex items-center gap-2 p-2 rounded-2xl bg-card border border-border/70 shadow-sm"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search public decks, folders, authors..."
              className="pl-9 pr-8 h-10 rounded-xl border-border bg-background/80 text-sm focus-visible:ring-primary/40"
              autoFocus
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-md focus:outline-none"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <Button
            type="submit"
            className="h-10 px-3 sm:px-5 rounded-xl font-semibold gap-1.5 shrink-0"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Search</span>
          </Button>
        </form>
      ) : (
        /* Item Type Filter Tabs */
        <div className="flex items-center justify-between p-2 rounded-2xl bg-card border border-border/70 shadow-sm">
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => handleItemTypeChange('all')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer',
                itemType === 'all'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              All Items
            </button>
            <button
              type="button"
              onClick={() => handleItemTypeChange('deck')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer',
                itemType === 'deck'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Decks</span>
            </button>
            <button
              type="button"
              onClick={() => handleItemTypeChange('folder')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer',
                itemType === 'folder'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <FolderIcon className="w-3.5 h-3.5" />
              <span>Folders</span>
            </button>
          </div>
        </div>
      )}

      {/* Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-[140px] rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <Card className="rounded-3xl border-border/80 p-8 text-center bg-card/60">
          <p className="text-sm text-destructive">
            {error?.message || 'Failed to load community items.'}
          </p>
        </Card>
      ) : items.length === 0 ? (
        <Card className="rounded-3xl border-2 border-dashed border-border/80 p-10 sm:p-14 text-center bg-card/40">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            {mode === 'search' ? (
              <Search className="w-6 h-6" />
            ) : (
              <Globe className="w-6 h-6" />
            )}
          </div>
          <p className="text-lg font-semibold text-foreground mb-1">
            {mode === 'search' && submittedQuery
              ? 'No matches found'
              : mode === 'search'
              ? 'Start searching'
              : 'No community items yet'}
          </p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {mode === 'search' && submittedQuery
              ? `No public decks or folders matched "${submittedQuery}". Try refining your query or search terms.`
              : mode === 'search'
              ? 'Type a keyword and click Search to find public decks and folders.'
              : 'Be the first to share a public deck or folder with the community!'}
          </p>
          {mode === 'search' && submittedQuery && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearSearch}
              className="mt-5 rounded-xl"
            >
              Clear search
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Mixed items grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) =>
              item.type === 'folder' ? (
                <CommunityFolderCard key={`folder-${item.id}`} folder={item} />
              ) : (
                <CommunityDeckCard key={`deck-${item.id}`} deck={item} />
              )
            )}
          </div>

          {/* Pagination Navigation Bar */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border/60">
              <span className="text-xs text-muted-foreground">
                Showing page <span className="font-semibold text-foreground">{page}</span> of{' '}
                <span className="font-semibold text-foreground">{totalPages}</span> ({total} items total)
              </span>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page <= 1}
                  className="rounded-xl h-8 px-2.5 gap-1 font-medium text-xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>

                {/* Page Number Buttons */}
                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                    .filter((p) => {
                      if (totalPages <= 7) return true
                      return (
                        p === 1 ||
                        p === totalPages ||
                        Math.abs(p - page) <= 1
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
                            variant={page === p ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setPage(p)}
                            className={cn(
                              'h-8 w-8 p-0 rounded-xl text-xs font-semibold',
                              page === p
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
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
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={page >= totalPages}
                  className="rounded-xl h-8 px-2.5 gap-1 font-medium text-xs"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
