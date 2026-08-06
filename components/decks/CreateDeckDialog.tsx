"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Alert } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import { Plus } from "lucide-react"
import { ColorPicker } from "@/components/ui/color-picker"

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
  const [newDeckDescription, setNewDeckDescription] = useState("")
  const [createError, setCreateError] = useState("")

  const handleCreateDeck = (e: React.FormEvent) => {
    e.preventDefault()
    setCreateError("")
    if (!newDeckName.trim()) {
      setCreateError("Deck name is required.")
      return
    }

    createDeck.mutate(
      { name: newDeckName, color: newDeckColor, description: newDeckDescription, folderId },
      {
        onSuccess: (newDeck) => {
          onOpenChange(false)
          setNewDeckName("")
          setNewDeckColor("default")
          setNewDeckDescription("")
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
          <DialogHeader className="flex flex-row items-center gap-3 space-y-0 text-left">
            <div className="p-2 rounded-2xl bg-primary/10 text-primary">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">Create New Deck</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Enter a name and choose a color for your new deck.
              </DialogDescription>
            </div>
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
              <ColorPicker
                color={newDeckColor}
                onChange={setNewDeckColor}
                className={createDeck.isPending ? "opacity-50 pointer-events-none" : ""}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={newDeckDescription}
                onChange={(e) => setNewDeckDescription(e.target.value)}
                placeholder="What is this deck about?"
                maxLength={500}
                disabled={createDeck.isPending}
                className="resize-none h-20"
              />
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
