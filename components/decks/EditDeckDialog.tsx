"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
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
import {
  MAX_NAME_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  LIMIT_COUNTER_THRESHOLD,
} from "@/lib/constants"
import { cn } from "@/lib/utils"

interface EditDeckDialogProps {
  deck: Deck | null
  onClose: () => void
}

export function EditDeckDialog({ deck, onClose }: EditDeckDialogProps) {
  const t = useTranslations("Decks.editDialog")
  const tCommon = useTranslations("Common")
  const updateDeck = useUpdateDeck()
  const uploadDeckCover = useUploadDeckCover()

  const [editName, setEditName] = useState(deck?.name || "")
  const [editDescription, setEditDescription] = useState(
    deck?.properties?.description || ""
  )
  const [editColor, setEditColor] = useState(
    deck?.properties?.color || "default"
  )
  const [coverUrl, setCoverUrl] = useState(
    deck?.properties?.cover_image_url || ""
  )
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [editError, setEditError] = useState("")

  const nameThreshold = Math.ceil(MAX_NAME_LENGTH * LIMIT_COUNTER_THRESHOLD)
  const descThreshold = Math.ceil(
    MAX_DESCRIPTION_LENGTH * LIMIT_COUNTER_THRESHOLD
  )

  useEffect(() => {
    if (deck) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setEditName(deck.name || "")
      setEditDescription(deck.properties?.description || "")
      setEditColor(deck.properties?.color || "default")
      setCoverUrl(deck.properties?.cover_image_url || "")
      setCoverFile(null)
      setEditError("")
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [deck])

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditError("")

    if (!editName.trim()) {
      setEditError(t("nameRequired"))
      return
    }

    if (!deck) return

    try {
      if (coverFile) {
        await uploadDeckCover.mutateAsync({ deckId: deck.id, file: coverFile })
      }

      const finalCoverUrl = coverFile ? undefined : coverUrl || null

      updateDeck.mutate(
        {
          deckId: deck.id,
          name: editName.trim(),
          description: editDescription.trim() || null,
          color: editColor,
          coverImageUrl: finalCoverUrl,
        },
        {
          onSuccess: () => onClose(),
          onError: (err) =>
            setEditError(err instanceof Error ? err.message : tCommon("error")),
        }
      )
    } catch (err) {
      setEditError(err instanceof Error ? err.message : t("coverUploadError"))
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
            <div className="rounded-2xl bg-primary/10 p-2 text-primary">
              <Pencil className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                {t("title")}
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-xs text-muted-foreground">
                {t("description")}
              </DialogDescription>
            </div>
          </DialogHeader>
          <div className="grid max-h-[70vh] gap-4 overflow-y-auto px-1 py-4">
            {editError && <Alert variant="destructive">{editError}</Alert>}

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>{t("nameLabel")}</Label>
                {editName.length >= nameThreshold && (
                  <span
                    className={cn(
                      "font-mono text-xs tabular-nums",
                      editName.length >= MAX_NAME_LENGTH
                        ? "font-semibold text-destructive"
                        : "text-muted-foreground"
                    )}
                  >
                    {editName.length}/{MAX_NAME_LENGTH}
                  </span>
                )}
              </div>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                maxLength={MAX_NAME_LENGTH}
                disabled={updateDeck.isPending || uploadDeckCover.isPending}
                required
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>{t("descriptionLabel")}</Label>
                {editDescription.length >= descThreshold && (
                  <span
                    className={cn(
                      "font-mono text-xs tabular-nums",
                      editDescription.length >= MAX_DESCRIPTION_LENGTH
                        ? "font-semibold text-destructive"
                        : "text-muted-foreground"
                    )}
                  >
                    {editDescription.length}/{MAX_DESCRIPTION_LENGTH}
                  </span>
                )}
              </div>
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                maxLength={MAX_DESCRIPTION_LENGTH}
                disabled={updateDeck.isPending || uploadDeckCover.isPending}
                placeholder={t("descriptionPlaceholder")}
              />
            </div>

            <div className="grid gap-2">
              <Label>{t("colorLabel")}</Label>
              <ColorPicker
                color={editColor}
                onChange={setEditColor}
                className={
                  updateDeck.isPending || uploadDeckCover.isPending
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </div>

            <div className="grid gap-2">
              <Label>{t("coverImageLabel")}</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  setCoverFile(e.target.files?.[0] || null)
                  if (e.target.files?.[0]) setCoverUrl("")
                }}
                disabled={updateDeck.isPending || uploadDeckCover.isPending}
              />
              <div className="text-center text-xs text-muted-foreground">
                {t("or")}
              </div>
              <Input
                type="url"
                placeholder={t("coverUrlPlaceholder")}
                value={coverUrl}
                onChange={(e) => {
                  setCoverUrl(e.target.value)
                  if (e.target.value) setCoverFile(null)
                }}
                disabled={
                  updateDeck.isPending ||
                  uploadDeckCover.isPending ||
                  !!coverFile
                }
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
              {tCommon("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={updateDeck.isPending || uploadDeckCover.isPending}
            >
              {updateDeck.isPending || uploadDeckCover.isPending
                ? tCommon("saving")
                : tCommon("saveChanges")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
