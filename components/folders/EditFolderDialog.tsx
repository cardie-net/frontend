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
  const [description, setDescription] = useState(folder?.properties?.description || "")
  const [color, setColor] = useState(folder?.properties?.color || "default")
  const [coverUrl, setCoverUrl] = useState(folder?.properties?.cover_image_url || "")
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [error, setError] = useState("")

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
        await uploadFolderCover.mutateAsync({ folderId: folder.id, file: coverFile })
      }

      const finalCoverUrl = coverFile ? undefined : (coverUrl || null)

      updateFolder.mutate(
        {
          folderId: folder.id,
          name: name.trim(),
          description: description.trim() || null,
          color,
          coverImageUrl: finalCoverUrl
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
            <div className="p-2 rounded-2xl bg-primary/10 text-primary">
              <Pencil className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">{t("title")}</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {t("description")}
              </DialogDescription>
            </div>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-1">
            {error && <Alert variant="destructive">{error}</Alert>}

            <div className="grid gap-2">
              <Label>{t("nameLabel")}</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={80}
                disabled={updateFolder.isPending || uploadFolderCover.isPending}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>{t("descriptionLabel")}</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                disabled={updateFolder.isPending || uploadFolderCover.isPending}
                placeholder={t("descriptionPlaceholder")}
              />
            </div>

            <div className="grid gap-2">
              <Label>{t("colorLabel")}</Label>
              <ColorPicker
                color={color}
                onChange={setColor}
                className={updateFolder.isPending || uploadFolderCover.isPending ? "opacity-50 pointer-events-none" : ""}
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
              <div className="text-xs text-muted-foreground text-center">{t("or")}</div>
              <Input
                type="url"
                placeholder={t("coverUrlPlaceholder")}
                value={coverUrl}
                onChange={(e) => {
                  setCoverUrl(e.target.value)
                  if (e.target.value) setCoverFile(null)
                }}
                disabled={updateFolder.isPending || uploadFolderCover.isPending || !!coverFile}
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
            <Button type="submit" disabled={updateFolder.isPending || uploadFolderCover.isPending}>
              {updateFolder.isPending || uploadFolderCover.isPending ? tCommon("saving") : tCommon("saveChanges")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
