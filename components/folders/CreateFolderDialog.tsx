"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Alert } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ColorPicker } from "@/components/ui/color-picker"
import { useCreateFolder } from "@/hooks/useFolders"
import { FolderPlus } from "lucide-react"
import {
  MAX_NAME_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  LIMIT_COUNTER_THRESHOLD,
} from "@/lib/constants"
import { cn } from "@/lib/utils"

interface CreateFolderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  parentId?: string | null
}

export function CreateFolderDialog({
  open,
  onOpenChange,
  parentId,
}: CreateFolderDialogProps) {
  const t = useTranslations("Folders.createDialog")
  const tCommon = useTranslations("Common")
  const createFolder = useCreateFolder()

  const [name, setName] = useState("")
  const [color, setColor] = useState("default")
  const [description, setDescription] = useState("")
  const [createError, setCreateError] = useState("")

  const nameThreshold = Math.ceil(MAX_NAME_LENGTH * LIMIT_COUNTER_THRESHOLD)
  const descThreshold = Math.ceil(
    MAX_DESCRIPTION_LENGTH * LIMIT_COUNTER_THRESHOLD
  )

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault()
    setCreateError("")
    if (!name.trim()) {
      setCreateError(t("nameRequired"))
      return
    }

    createFolder.mutate(
      {
        name: name.trim(),
        color,
        description: description || undefined,
        parentId,
      },
      {
        onSuccess: () => {
          onOpenChange(false)
          setName("")
          setColor("default")
          setDescription("")
        },
        onError: (err) =>
          setCreateError(err instanceof Error ? err.message : tCommon("error")),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleCreateFolder}>
          <DialogHeader className="flex flex-row items-center gap-3 space-y-0 text-left">
            <div className="rounded-2xl bg-primary/10 p-2 text-primary">
              <FolderPlus className="h-5 w-5" />
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
                <Label htmlFor="folder-name">{t("nameLabel")}</Label>
                {name.length >= nameThreshold && (
                  <span
                    className={cn(
                      "font-mono text-xs tabular-nums",
                      name.length >= MAX_NAME_LENGTH
                        ? "font-semibold text-destructive"
                        : "text-muted-foreground"
                    )}
                  >
                    {name.length}/{MAX_NAME_LENGTH}
                  </span>
                )}
              </div>
              <Input
                id="folder-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("namePlaceholder")}
                maxLength={MAX_NAME_LENGTH}
                disabled={createFolder.isPending}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>{t("colorLabel")}</Label>
              <ColorPicker
                color={color}
                onChange={setColor}
                className={
                  createFolder.isPending ? "pointer-events-none opacity-50" : ""
                }
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="folder-description">
                  {t("descriptionLabel")}
                </Label>
                {description.length >= descThreshold && (
                  <span
                    className={cn(
                      "font-mono text-xs tabular-nums",
                      description.length >= MAX_DESCRIPTION_LENGTH
                        ? "font-semibold text-destructive"
                        : "text-muted-foreground"
                    )}
                  >
                    {description.length}/{MAX_DESCRIPTION_LENGTH}
                  </span>
                )}
              </div>
              <Textarea
                id="folder-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("descriptionPlaceholder")}
                maxLength={MAX_DESCRIPTION_LENGTH}
                disabled={createFolder.isPending}
                className="h-20 resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createFolder.isPending}
            >
              {tCommon("cancel")}
            </Button>
            <Button type="submit" disabled={createFolder.isPending}>
              {createFolder.isPending ? tCommon("creating") : tCommon("create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
