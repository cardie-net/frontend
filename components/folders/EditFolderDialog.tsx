"use client"

import { useState, useEffect } from "react"
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
import { DECK_COLORS } from "@/lib/decks"
import { Folder } from "@/types"
import { useUpdateFolder, useUploadFolderCover } from "@/hooks/useFolders"
import { LockKeyhole, EyeOff, Globe, Pencil } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

interface EditFolderDialogProps {
  folder: Folder | null
  onClose: () => void
}

export function EditFolderDialog({ folder, onClose }: EditFolderDialogProps) {
  const updateFolder = useUpdateFolder()
  const uploadFolderCover = useUploadFolderCover()

  const [name, setName] = useState(folder?.name || "")
  const [description, setDescription] = useState(folder?.properties?.description || "")
  const [coverUrl, setCoverUrl] = useState(folder?.properties?.cover_image_url || "")
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [color, setColor] = useState(folder?.properties?.color || "default")
  const [privacy, setPrivacy] = useState<"private" | "unlisted" | "public">(
    folder?.privacy || "private"
  )
  const [slug, setSlug] = useState(folder?.slug || "")
  const [error, setError] = useState("")

  useEffect(() => {
    if (folder) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setName(folder.name || "")
      setDescription(folder.properties?.description || "")
      setCoverUrl(folder.properties?.cover_image_url || "")
      setCoverFile(null)
      setColor(folder.properties?.color || "default")
      setPrivacy(folder.privacy || "private")
      setSlug(folder.slug || "")
      setError("")
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [folder])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!folder) return

    if (!name.trim()) {
      setError("Folder name is required.")
      return
    }

    if (slug.trim() && !/^[a-z0-9-]+$/.test(slug.trim())) {
      setError("Slug can only contain lowercase letters, numbers, and hyphens.")
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
          color,
          privacy,
          slug: slug.trim() || undefined,
          description: description || undefined,
          coverImageUrl: finalCoverUrl
        },
        {
          onSuccess: () => onClose(),
          onError: (err) =>
            setError(err instanceof Error ? err.message : "An error occurred"),
        }
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred uploading cover image")
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
              <DialogTitle className="text-base font-semibold">Edit Folder</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Update the name, description, cover image, and privacy settings.
              </DialogDescription>
            </div>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-1">
            {error && <Alert variant="destructive">{error}</Alert>}

            <div className="grid gap-2">
              <Label htmlFor="edit-folder-name">Folder Name</Label>
              <Input
                id="edit-folder-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={80}
                disabled={updateFolder.isPending || uploadFolderCover.isPending}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                disabled={updateFolder.isPending || uploadFolderCover.isPending}
                placeholder="Optional description..."
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
                disabled={updateFolder.isPending || uploadFolderCover.isPending}
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
                disabled={updateFolder.isPending || uploadFolderCover.isPending || !!coverFile}
              />
            </div>

            <div className="grid gap-2">
              <Label>Privacy</Label>
              <div className="flex gap-2">
                {(
                  [
                    {
                      id: "private",
                      label: "Private",
                      icon: <LockKeyhole className="h-4 w-4" />,
                    },
                    {
                      id: "unlisted",
                      label: "Unlisted",
                      icon: <EyeOff className="h-4 w-4" />,
                    },
                    {
                      id: "public",
                      label: "Public",
                      icon: <Globe className="h-4 w-4" />,
                    },
                  ] as const
                ).map((opt) => (
                  <Button
                    key={opt.id}
                    type="button"
                    variant={privacy === opt.id ? "default" : "outline"}
                    onClick={() => setPrivacy(opt.id)}
                    disabled={updateFolder.isPending}
                    className="flex-1"
                  >
                    {opt.icon}
                    <span className="ml-2">{opt.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-folder-slug">URL Slug</Label>
              <Input
                id="edit-folder-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                maxLength={80}
                disabled={updateFolder.isPending}
                className="font-mono text-sm"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>Color Accent</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                disabled={updateFolder.isPending}
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
              onClick={onClose}
              disabled={updateFolder.isPending || uploadFolderCover.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateFolder.isPending || uploadFolderCover.isPending}>
              {updateFolder.isPending || uploadFolderCover.isPending ? "Saving..." : "Save Settings"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
