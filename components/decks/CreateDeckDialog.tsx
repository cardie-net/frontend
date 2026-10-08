"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
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

import { useCreateDeck } from "@/hooks/useDecks"
import { Plus } from "lucide-react"
import { ColorPicker } from "@/components/ui/color-picker"
import {
  MAX_NAME_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  LIMIT_COUNTER_THRESHOLD,
} from "@/lib/constants"
import { cn } from "@/lib/utils"

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
  const t = useTranslations("Decks.createDialog")
  const tCommon = useTranslations("Common")
  const router = useRouter()
  const { user } = useAuth()
  const createDeck = useCreateDeck()

  const [newDeckName, setNewDeckName] = useState("")
  const [newDeckColor, setNewDeckColor] = useState("default")
  const [newDeckDescription, setNewDeckDescription] = useState("")
  const [createError, setCreateError] = useState("")

  const nameThreshold = Math.ceil(MAX_NAME_LENGTH * LIMIT_COUNTER_THRESHOLD)
  const descThreshold = Math.ceil(
    MAX_DESCRIPTION_LENGTH * LIMIT_COUNTER_THRESHOLD
  )

  const handleCreateDeck = (e: React.FormEvent) => {
    e.preventDefault()
    setCreateError("")
    if (!newDeckName.trim()) {
      setCreateError(t("nameRequired"))
      return
    }

    createDeck.mutate(
      {
        name: newDeckName,
        color: newDeckColor,
        description: newDeckDescription,
        folderId,
      },
      {
        onSuccess: (newDeck) => {
          onOpenChange(false)
          setNewDeckName("")
          setNewDeckColor("default")
          setNewDeckDescription("")
          router.push(`/${user?.username || ""}/${newDeck.slug || newDeck.id}`)
        },
        onError: (err) =>
          setCreateError(err instanceof Error ? err.message : tCommon("error")),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleCreateDeck}>
          <DialogHeader className="flex flex-row items-center gap-3 space-y-0 text-left">
            <div className="rounded-2xl bg-primary/10 p-2 text-primary">
              <Plus className="h-5 w-5" />
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
          <div className="grid gap-4 py-4">
            {createError && <Alert variant="destructive">{createError}</Alert>}
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="name">{t("nameLabel")}</Label>
                {newDeckName.length >= nameThreshold && (
                  <span
                    className={cn(
                      "font-mono text-xs tabular-nums",
                      newDeckName.length >= MAX_NAME_LENGTH
                        ? "font-semibold text-destructive"
                        : "text-muted-foreground"
                    )}
                  >
                    {newDeckName.length}/{MAX_NAME_LENGTH}
                  </span>
                )}
              </div>
              <Input
                id="name"
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)}
                placeholder={t("namePlaceholder")}
                maxLength={MAX_NAME_LENGTH}
                disabled={createDeck.isPending}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t("colorLabel")}</Label>
              <ColorPicker
                color={newDeckColor}
                onChange={setNewDeckColor}
                className={
                  createDeck.isPending ? "pointer-events-none opacity-50" : ""
                }
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="description">{t("descriptionLabel")}</Label>
                {newDeckDescription.length >= descThreshold && (
                  <span
                    className={cn(
                      "font-mono text-xs tabular-nums",
                      newDeckDescription.length >= MAX_DESCRIPTION_LENGTH
                        ? "font-semibold text-destructive"
                        : "text-muted-foreground"
                    )}
                  >
                    {newDeckDescription.length}/{MAX_DESCRIPTION_LENGTH}
                  </span>
                )}
              </div>
              <Textarea
                id="description"
                value={newDeckDescription}
                onChange={(e) => setNewDeckDescription(e.target.value)}
                placeholder={t("descriptionPlaceholder")}
                maxLength={MAX_DESCRIPTION_LENGTH}
                disabled={createDeck.isPending}
                className="h-20 resize-none"
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
              {tCommon("cancel")}
            </Button>
            <Button type="submit" disabled={createDeck.isPending}>
              {createDeck.isPending ? tCommon("creating") : tCommon("create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
