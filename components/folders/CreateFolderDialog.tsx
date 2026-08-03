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
import { useCreateFolder } from "@/hooks/useFolders"
import { LockKeyhole, EyeOff, Globe } from "lucide-react"

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
  const createFolder = useCreateFolder()

  const [name, setName] = useState("")
  const [color, setColor] = useState("default")
  const [privacy, setPrivacy] = useState<"private" | "unlisted" | "public">("private")
  const [slug, setSlug] = useState("")
  const [createError, setCreateError] = useState("")

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault()
    setCreateError("")
    if (!name.trim()) {
      setCreateError("Folder name is required.")
      return
    }

    if (slug.trim() && !/^[a-z0-9-]+$/.test(slug.trim())) {
      setCreateError("Slug can only contain lowercase letters, numbers, and hyphens.")
      return
    }

    createFolder.mutate(
      {
        name: name.trim(),
        color,
        privacy,
        slug: slug.trim() || undefined,
        parentId,
      },
      {
        onSuccess: () => {
          onOpenChange(false)
          setName("")
          setColor("default")
          setPrivacy("private")
          setSlug("")
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
        <form onSubmit={handleCreateFolder}>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Enter details for your new folder.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {createError && <Alert variant="destructive">{createError}</Alert>}

            <div className="grid gap-2">
              <Label htmlFor="folder-name">Folder Name</Label>
              <Input
                id="folder-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Science Decks"
                maxLength={80}
                disabled={createFolder.isPending}
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
                    disabled={createFolder.isPending}
                    className="flex-1"
                  >
                    {opt.icon}
                    <span className="ml-2">{opt.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="folder-slug">URL Slug (Optional)</Label>
              <Input
                id="folder-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="science-decks"
                maxLength={80}
                disabled={createFolder.isPending}
                className="font-mono text-sm"
              />
            </div>

            <div className="grid gap-2">
              <Label>Color Accent</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                disabled={createFolder.isPending}
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
              disabled={createFolder.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createFolder.isPending}>
              {createFolder.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
