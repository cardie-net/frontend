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
import { useUpdateDeck } from "@/hooks/useDecks"

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

  const [sharePrivacy, setSharePrivacy] = useState(deck?.privacy || "private")
  const [shareSlug, setShareSlug] = useState(deck?.slug || "")
  const [shareError, setShareError] = useState("")
  const [isLinkCopied, setIsLinkCopied] = useState(false)

  const handleSaveShare = (e: React.FormEvent) => {
    e.preventDefault()
    setShareError("")

    if (!/^[a-z0-9-]+$/.test(shareSlug)) {
      setShareError(
        "Slug can only contain lowercase letters, numbers, and hyphens."
      )
      return
    }

    if (!deck) return

    updateDeck.mutate(
      { deckId: deck.id, privacy: sharePrivacy, slug: shareSlug },
      {
        onSuccess: () => onClose(),
        onError: (err) =>
          setShareError(
            err instanceof Error ? err.message : "An error occurred"
          ),
      }
    )
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
            <DialogTitle>Share Settings</DialogTitle>
            <DialogDescription>
              Update the privacy and URL slug for your deck.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {shareError && <Alert variant="destructive">{shareError}</Alert>}

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
              disabled={updateDeck.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateDeck.isPending}>
              {updateDeck.isPending ? "Saving..." : "Save Settings"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
