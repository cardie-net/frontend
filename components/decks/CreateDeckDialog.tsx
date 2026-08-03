"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Alert } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/lib/AuthContext"
import { DECK_COLORS } from "@/lib/decks"
import { useCreateDeck } from "@/hooks/useDecks"

interface CreateDeckDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  folderId?: string | null
}

export function CreateDeckDialog({
  open,
  onOpenChange,
  folderId,
}: CreateDeckDialogProps) {
  const router = useRouter()
  const { user } = useAuth()
  const createDeck = useCreateDeck()

  const [newDeckName, setNewDeckName] = useState("")
  const [newDeckColor, setNewDeckColor] = useState("default")
  const [createError, setCreateError] = useState("")

  const handleCreateDeck = (e: React.FormEvent) => {
    e.preventDefault()
    setCreateError("")
    if (!newDeckName.trim()) {
      setCreateError("Deck name is required.")
      return
    }

    createDeck.mutate(
      { name: newDeckName, color: newDeckColor, folderId },
      {
        onSuccess: (newDeck) => {
          onOpenChange(false)
          setNewDeckName("")
          setNewDeckColor("default")
          router.push(`/${user?.username || ""}/${newDeck.slug || newDeck.id}`)
        },
        onError: (err) =>
          setCreateError(
            err instanceof Error ? err.message : "An error occurred"
          ),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleCreateDeck}>
          <DialogHeader>
            <DialogTitle>Create New Deck</DialogTitle>
            <DialogDescription>
              Enter a name and choose a color for your new deck.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {createError && <Alert variant="destructive">{createError}</Alert>}
            <div className="grid gap-2">
              <Label htmlFor="name">Deck Name</Label>
              <Input
                id="name"
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)}
                placeholder="e.g. Spanish Vocabulary"
                maxLength={80}
                disabled={createDeck.isPending}
              />
            </div>
            <div className="grid gap-2">
              <Label>Color</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                value={newDeckColor}
                onChange={(e) => setNewDeckColor(e.target.value)}
                disabled={createDeck.isPending}
              >
                {DECK_COLORS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createDeck.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createDeck.isPending}>
              {createDeck.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
