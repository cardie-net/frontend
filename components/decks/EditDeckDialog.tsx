"use client"

import { useState } from "react"
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
import { Pencil } from "lucide-react"
import { Deck } from "@/types"
import { useUpdateDeck, useUploadDeckCover } from "@/hooks/useDecks"
import { Textarea } from "@/components/ui/textarea"
import { ColorPicker } from "@/components/ui/color-picker"

interface EditDeckDialogProps {
  deck: Deck | null
  onClose: () => void
}

export function EditDeckDialog({ deck, onClose }: EditDeckDialogProps) {
  const updateDeck = useUpdateDeck()
  const uploadDeckCover = useUploadDeckCover()

  const [editName, setEditName] = useState(deck?.name || "")
  const [editDescription, setEditDescription] = useState(deck?.properties?.description || "")
  const [editColor, setEditColor] = useState(deck?.properties?.color || "default")
  const [coverUrl, setCoverUrl] = useState(deck?.properties?.cover_image_url || "")
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [editError, setEditError] = useState("")

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditError("")

    if (!editName.trim()) {
      setEditError("Deck name is required.")
      return
    }

    if (!deck) return

    try {
      if (coverFile) {
        await uploadDeckCover.mutateAsync({ deckId: deck.id, file: coverFile })
      }

      const finalCoverUrl = coverFile ? undefined : (coverUrl || null)

      updateDeck.mutate(
        { 
          deckId: deck.id, 
          name: editName,
          description: editDescription || undefined,
          color: editColor,
          coverImageUrl: finalCoverUrl
        },
        {
          onSuccess: () => onClose(),
          onError: (err) =>
            setEditError(
              err instanceof Error ? err.message : "An error occurred"
            ),
        }
      )
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "An error occurred uploading cover image")
    }
  }

  return (
    <Dialog
      open={!!deck}
      onOpenChange={(open) => !updateDeck.isPending && !open && onClose()}
    >
      <DialogContent>
        <form onSubmit={handleSaveEdit}>
          <DialogHeader className="flex flex-row items-center gap-3 space-y-0 text-left">
            <div className="p-2 rounded-2xl bg-primary/10 text-primary">
              <Pencil className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">Edit Deck</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Update the name, description, color, and cover image for your deck.
              </DialogDescription>
            </div>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-1">
            {editError && <Alert variant="destructive">{editError}</Alert>}

            <div className="grid gap-2">
              <Label>Name</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                maxLength={80}
                disabled={updateDeck.isPending || uploadDeckCover.isPending}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                maxLength={500}
                disabled={updateDeck.isPending || uploadDeckCover.isPending}
                placeholder="Optional description..."
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Color Accent</Label>
              <ColorPicker
                color={editColor}
                onChange={setEditColor}
                className={updateDeck.isPending || uploadDeckCover.isPending ? "opacity-50 pointer-events-none" : ""}
              />
            </div>

            <div className="grid gap-2">
              <Label>Cover Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  setCoverFile(e.target.files?.[0] || null)
                  if (e.target.files?.[0]) setCoverUrl("")
                }}
                disabled={updateDeck.isPending || uploadDeckCover.isPending}
              />
              <div className="text-xs text-muted-foreground text-center">OR</div>
              <Input
                type="url"
                placeholder="https://example.com/image.png"
                value={coverUrl}
                onChange={(e) => {
                  setCoverUrl(e.target.value)
                  if (e.target.value) setCoverFile(null)
                }}
                disabled={updateDeck.isPending || uploadDeckCover.isPending || !!coverFile}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={updateDeck.isPending || uploadDeckCover.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateDeck.isPending || uploadDeckCover.isPending}>
              {updateDeck.isPending || uploadDeckCover.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

