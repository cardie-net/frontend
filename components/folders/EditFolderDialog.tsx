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
import { DECK_COLORS } from "@/lib/decks"
import { Folder } from "@/types"
import { useUpdateFolder } from "@/hooks/useFolders"
import { LockKeyhole, EyeOff, Globe } from "lucide-react"

interface EditFolderDialogProps {
  folder: Folder | null
  onClose: () => void
}

export function EditFolderDialog({ folder, onClose }: EditFolderDialogProps) {
  const updateFolder = useUpdateFolder()

  const [name, setName] = useState(folder?.name || "")
  const [color, setColor] = useState(folder?.properties?.color || "default")
  const [privacy, setPrivacy] = useState<"private" | "unlisted" | "public">(
    folder?.privacy || "private"
  )
  const [slug, setSlug] = useState(folder?.slug || "")
  const [error, setError] = useState("")

  const handleSave = (e: React.FormEvent) => {
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

    updateFolder.mutate(
      {
        folderId: folder.id,
        name: name.trim(),
        color,
        privacy,
        slug: slug.trim() || undefined,
      },
      {
        onSuccess: () => onClose(),
        onError: (err) =>
          setError(err instanceof Error ? err.message : "An error occurred"),
      }
    )
  }

  return (
    <Dialog
      open={!!folder}
      onOpenChange={(open) => !updateFolder.isPending && !open && onClose()}
    >
      <DialogContent>
        <form onSubmit={handleSave}>
          <DialogHeader>
            <DialogTitle>Edit Folder</DialogTitle>
            <DialogDescription>
              Update the name, color accent, slug, and privacy settings.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {error && <Alert variant="destructive">{error}</Alert>}

            <div className="grid gap-2">
              <Label htmlFor="edit-folder-name">Folder Name</Label>
              <Input
                id="edit-folder-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={80}
                disabled={updateFolder.isPending}
                required
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
              disabled={updateFolder.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateFolder.isPending}>
              {updateFolder.isPending ? "Saving..." : "Save Settings"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
