"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/AuthContext"
import { Button } from "@/components/ui/button"
import { Alert } from "@/components/ui/alert"
import { Plus, Upload } from "lucide-react"
import { Deck } from "@/types"
import { CreateDeckDialog } from "@/components/decks/CreateDeckDialog"
import { DeckImportDialog } from "@/components/decks/DeckImportDialog"
import { ShareDeckDialog } from "@/components/decks/ShareDeckDialog"
import { DeckCard } from "@/components/decks/DeckCard"
import { useDecks, useDeleteDeck } from "@/hooks/useDecks"
import { useSRSCounts } from "@/hooks/useSRSCounts"

export default function DecksPage() {
  const { user, loading: authLoading } = useAuth()

  const {
    data: decks = [],
    isLoading: decksLoading,
    error: decksError,
  } = useDecks()
  const { data: srsCountsData } = useSRSCounts()
  const deleteDeck = useDeleteDeck()

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [shareDeckTarget, setShareDeckTarget] = useState<Deck | null>(null)

  const handleDeleteDeck = (deckId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this deck? All cards will be lost."
      )
    )
      return
    deleteDeck.mutate(deckId)
  }

  if (authLoading || decksLoading) {
    return <div className="p-8">Loading decks...</div>
  }

  if (!user || user.is_guest) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <p>Please log in to view your decks.</p>
        <Link href="/login">
          <Button>Log In</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-5xl p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Decks</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsImportDialogOpen(true)}
          >
            <Upload className="mr-2 h-4 w-4" /> Import
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Deck
          </Button>
        </div>
      </div>

      {decksError && (
        <Alert variant="destructive" className="mb-6">
          {decksError.message}
        </Alert>
      )}
      {deleteDeck.error && (
        <Alert variant="destructive" className="mb-6">
          {deleteDeck.error.message}
        </Alert>
      )}

      {decks.length === 0 ? (
        <div className="rounded-lg border bg-muted/20 p-12 text-center">
          <p className="mb-4 text-muted-foreground">
            You don&apos;t have any decks yet.
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)} variant="outline">
            Create your first deck
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {decks.map((deck) => (
            <DeckCard
              key={deck.id}
              deck={deck}
              username={user.username}
              srsCounts={srsCountsData?.[deck.id]}
              onShare={setShareDeckTarget}
              onDelete={handleDeleteDeck}
            />
          ))}
        </div>
      )}

      <CreateDeckDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      {isImportDialogOpen && (
        <DeckImportDialog
          mode="create"
          username={user.username}
          onClose={() => setIsImportDialogOpen(false)}
        />
      )}

      <ShareDeckDialog
        key={shareDeckTarget?.id ?? "closed"}
        deck={shareDeckTarget}
        onClose={() => setShareDeckTarget(null)}
      />
    </div>
  )
}
