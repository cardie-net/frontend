"use client"

import { Suspense } from "react"
import { useParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { useDeck } from "@/hooks/useDecks"
import { useFolderBySlug } from "@/hooks/useFolders"
import { FolderView } from "@/components/folders/FolderView"
import { DeckView } from "@/components/decks/DeckView"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function SlugPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <SlugPageContent />
    </Suspense>
  )
}

function LoadingSkeleton() {
  return (
    <div className="container mx-auto max-w-5xl space-y-8 p-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  )
}

function SlugPageContent() {
  const tCommon = useTranslations("Common")
  const params = useParams<{ username: string; slug: string }>()
  const username = params.username
  const slug = params.slug

  const {
    data: deck,
    isLoading: deckLoading,
    error: deckError,
  } = useDeck(username, slug)

  const {
    data: folder,
    isLoading: folderLoading,
    error: folderError,
  } = useFolderBySlug(username, slug)

  const loading = deckLoading && folderLoading

  if (loading) {
    return <LoadingSkeleton />
  }

  if (folder) {
    return <FolderView username={username} folder={folder} />
  }

  if (deck) {
    return <DeckView username={username} slug={slug} deck={deck} />
  }

  return (
    <div className="mt-20 flex flex-1 items-center justify-center p-8">
      <div className="text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
        <h2 className="mb-4 text-2xl font-bold">
          {deckError?.message || folderError?.message || tCommon("notFound")}
        </h2>
        <Link href={`/${username}`}>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {tCommon("back")}
          </Button>
        </Link>
      </div>
    </div>
  )
}
