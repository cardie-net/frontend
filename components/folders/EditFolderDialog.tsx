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
import { ColorPicker } from "@/components/ui/color-picker"
import { Folder } from "@/types"
import { useUpdateFolder, useUploadFolderCover } from "@/hooks/useFolders"
import { Pencil } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import {
  MAX_NAME_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  LIMIT_COUNTER_THRESHOLD,
} from "@/lib/constants"
import { cn } from "@/lib/utils"

interface EditFolderDialogProps {
  folder: Folder | null
  onClose: () => void
}

export function EditFolderDialog({ folder, onClose }: EditFolderDialogProps) {
  const t = useTranslations("Folders.editDialog")
  const tCommon = useTranslations("Common")
  const updateFolder = useUpdateFolder()
  const uploadFolderCover = useUploadFolderCover()

  const [name, setName] = useState(folder?.name || "")
  const [description, setDescription] = useState(
    folder?.properties?.description || ""
  )
  const [color, setColor] = useState(folder?.properties?.color || "default")
  const [coverUrl, setCoverUrl] = useState(
    folder?.properties?.cover_image_url || ""
  )
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [error, setError] = useState("")

  const nameThreshold = Math.ceil(MAX_NAME_LENGTH * LIMIT_COUNTER_THRESHOLD)
  const descThreshold = Math.ceil(
    MAX_DESCRIPTION_LENGTH * LIMIT_COUNTER_THRESHOLD
  )

  useEffect(() => {
    if (folder) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setName(folder.name || "")
      setDescription(folder.properties?.description || "")
      setColor(folder.properties?.color || "default")
      setCoverUrl(folder.properties?.cover_image_url || "")
      setCoverFile(null)
      setError("")
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [folder])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!folder) return

    if (!name.trim()) {
      setError(t("nameRequired"))
      return
    }

    try {
      if (coverFile) {
        await uploadFolderCover.mutateAsync({
          folderId: folder.id,
          file: coverFile,
        })
      }

      const finalCoverUrl = coverFile ? undefined : coverUrl || null

      updateFolder.mutate(
        {
          folderId: folder.id,
          name: name.trim(),
          description: description.trim() || null,
          color,
          coverImageUrl: finalCoverUrl,
        },
        {
          onSuccess: () => onClose(),
          onError: (err) =>
            setError(err instanceof Error ? err.message : tCommon("error")),
        }
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : t("coverUploadError"))
    }
  }

  return (
    <Dialog
      open={!!folder}
      onOpenChange={(open) => !updateFolder.isPending && !open && onClose()}
    >
      <DialogContent>
        <form onSubmit={handleSave}>
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
            {error && <Alert variant="destructive">{error}</Alert>}

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>{t("nameLabel")}</Label>
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
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={MAX_NAME_LENGTH}
                disabled={updateFolder.isPending || uploadFolderCover.isPending}
                required
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>{t("descriptionLabel")}</Label>
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
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={MAX_DESCRIPTION_LENGTH}
                disabled={updateFolder.isPending || uploadFolderCover.isPending}
                placeholder={t("descriptionPlaceholder")}
              />
            </div>

            <div className="grid gap-2">
              <Label>{t("colorLabel")}</Label>
              <ColorPicker
                color={color}
                onChange={setColor}
                className={
                  updateFolder.isPending || uploadFolderCover.isPending
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
                disabled={updateFolder.isPending || uploadFolderCover.isPending}
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
                  updateFolder.isPending ||
                  uploadFolderCover.isPending ||
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
              disabled={updateFolder.isPending || uploadFolderCover.isPending}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={updateFolder.isPending || uploadFolderCover.isPending}
            >
              {updateFolder.isPending || uploadFolderCover.isPending
                ? tCommon("saving")
                : tCommon("saveChanges")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
