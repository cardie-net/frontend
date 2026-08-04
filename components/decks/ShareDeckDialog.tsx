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
import { LockKeyhole, EyeOff, Globe, Copy, Check } from "lucide-react"
import { Deck } from "@/types"
import { useAuth } from "@/lib/AuthContext"
import { useUpdateDeck, useUploadDeckCover } from "@/hooks/useDecks"
import { Textarea } from "@/components/ui/textarea"

interface ShareDeckDialogProps {
  deck: Deck | null
  onClose: () => void
}

/**
 * The parent renders this dialog with a `key={deck?.id}`, so the component
 * remounts whenever the target deck changes — state below is always
 * initialized from the current `deck` prop (no props→state sync effect).
 */
export function ShareDeckDialog({ deck, onClose }: ShareDeckDialogProps) {
  const { user } = useAuth()
  const updateDeck = useUpdateDeck()
  const uploadDeckCover = useUploadDeckCover()

  const [shareName, setShareName] = useState(deck?.name || "")
  const [shareDescription, setShareDescription] = useState(deck?.properties?.description || "")
  const [coverUrl, setCoverUrl] = useState(deck?.properties?.cover_image_url || "")
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [sharePrivacy, setSharePrivacy] = useState(deck?.privacy || "private")
  const [shareSlug, setShareSlug] = useState(deck?.slug || "")
  const [shareError, setShareError] = useState("")
  const [isLinkCopied, setIsLinkCopied] = useState(false)

  const handleSaveShare = async (e: React.FormEvent) => {
    e.preventDefault()
    setShareError("")

    if (!shareName.trim()) {
      setShareError("Deck name is required.")
      return
    }

    if (!/^[a-z0-9-]+$/.test(shareSlug)) {
      setShareError(
        "Slug can only contain lowercase letters, numbers, and hyphens."
      )
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
          name: shareName,
          description: shareDescription || undefined,
          privacy: sharePrivacy, 
          slug: shareSlug,
          coverImageUrl: finalCoverUrl
        },
        {
          onSuccess: () => onClose(),
          onError: (err) =>
            setShareError(
              err instanceof Error ? err.message : "An error occurred"
            ),
        }
      )
    } catch (err) {
      setShareError(err instanceof Error ? err.message : "An error occurred uploading cover image")
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/${user?.username}/${shareSlug || deck?.id}`
    )
    setIsLinkCopied(true)
    setTimeout(() => setIsLinkCopied(false), 2000)
  }

  return (
    <Dialog
      open={!!deck}
      onOpenChange={(open) => !updateDeck.isPending && !open && onClose()}
    >
      <DialogContent>
        <form onSubmit={handleSaveShare}>
          <DialogHeader>
            <DialogTitle>Deck Settings</DialogTitle>
            <DialogDescription>
              Update the settings, privacy, and URL slug for your deck.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-1">
            {shareError && <Alert variant="destructive">{shareError}</Alert>}

            <div className="grid gap-2">
              <Label>Name</Label>
              <Input
                value={shareName}
                onChange={(e) => setShareName(e.target.value)}
                maxLength={80}
                disabled={updateDeck.isPending || uploadDeckCover.isPending}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea
                value={shareDescription}
                onChange={(e) => setShareDescription(e.target.value)}
                maxLength={500}
                disabled={updateDeck.isPending || uploadDeckCover.isPending}
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
                    variant={sharePrivacy === opt.id ? "default" : "outline"}
                    onClick={() => setSharePrivacy(opt.id)}
                    disabled={updateDeck.isPending}
                    className="flex-1"
                  >
                    {opt.icon}
                    <span className="ml-2">{opt.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label>URL Slug</Label>
              <Input
                value={shareSlug}
                onChange={(e) => setShareSlug(e.target.value)}
                maxLength={50}
                disabled={updateDeck.isPending}
                required
                className="font-mono"
              />
            </div>

            <div className="grid gap-2">
              <Label>Share Link</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={
                    typeof window !== "undefined"
                      ? `${window.location.origin}/${user?.username}/${shareSlug || deck?.id}`
                      : ""
                  }
                  className="font-mono text-xs opacity-70"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCopyLink}
                >
                  {isLinkCopied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
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
              {updateDeck.isPending || uploadDeckCover.isPending ? "Saving..." : "Save Settings"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
