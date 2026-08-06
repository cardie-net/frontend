"use client"

import { useState } from "react"
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
  const [description, setDescription] = useState("")
  const [createError, setCreateError] = useState("")

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault()
    setCreateError("")
    if (!name.trim()) {
      setCreateError("Folder name is required.")
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
          <DialogHeader className="flex flex-row items-center gap-3 space-y-0 text-left">
            <div className="p-2 rounded-2xl bg-primary/10 text-primary">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">Create New Folder</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Enter details for your new folder.
              </DialogDescription>
            </div>
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
              <Label>Color Accent</Label>
              <ColorPicker
                color={color}
                onChange={setColor}
                className={createFolder.isPending ? "opacity-50 pointer-events-none" : ""}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="folder-description">Description (Optional)</Label>
              <Textarea
                id="folder-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this folder about?"
                maxLength={500}
                disabled={createFolder.isPending}
                className="resize-none h-20"
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
