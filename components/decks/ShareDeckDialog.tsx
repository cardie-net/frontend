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
import { LockKeyhole, EyeOff, Globe, Copy, Check, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Deck } from "@/types"
import { useAuth } from "@/lib/AuthContext"
import { useUpdateDeck } from "@/hooks/useDecks"

interface ShareDeckDialogProps {
  deck: Deck | null
  username?: string
  onClose: () => void
}

export function ShareDeckDialog({ deck, username, onClose }: ShareDeckDialogProps) {
  const { user } = useAuth()
  const updateDeck = useUpdateDeck()

  const [sharePrivacy, setSharePrivacy] = useState(deck?.privacy || "private")
  const [shareSlug, setShareSlug] = useState(deck?.slug || "")
  const [shareError, setShareError] = useState("")
  const [isLinkCopied, setIsLinkCopied] = useState(false)

  const isOwner = !!(user && deck && (!deck.user_id || user.id === deck.user_id))
  const ownerUsername = deck?.owner?.username || username || user?.username

  const handleSaveShare = async (e: React.FormEvent) => {
    e.preventDefault()
    setShareError("")

    if (!isOwner) {
      onClose()
      return
    }

    if (!/^[a-z0-9-]+$/.test(shareSlug)) {
      setShareError(
        "Slug can only contain lowercase letters, numbers, and hyphens."
      )
      return
    }

    if (!deck) return

    updateDeck.mutate(
      { 
        deckId: deck.id, 
        privacy: sharePrivacy, 
        slug: shareSlug,
      },
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
    const ownerName = deck?.owner?.username || username || user?.username || ""
    navigator.clipboard.writeText(
      `${window.location.origin}/${ownerName}/${shareSlug || deck?.slug || deck?.id}`
    )
    setIsLinkCopied(true)
    setTimeout(() => setIsLinkCopied(false), 2000)
  }

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/${ownerUsername || ""}/${shareSlug || deck?.slug || deck?.id}`
      : ""

  return (
    <Dialog
      open={!!deck}
      onOpenChange={(open) => !updateDeck.isPending && !open && onClose()}
    >
      <DialogContent>
        <form onSubmit={handleSaveShare}>
          <DialogHeader className="flex flex-row items-center gap-3 space-y-0 text-left">
            <div className="p-2 rounded-2xl bg-primary/10 text-primary">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                {isOwner ? "Share Settings" : "Share Deck"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {isOwner
                  ? "Update the privacy and URL slug for your deck."
                  : "Share this deck with others."}
              </DialogDescription>
            </div>
          </DialogHeader>
          <div className="grid gap-4 py-4 px-1">
            {shareError && <Alert variant="destructive">{shareError}</Alert>}

            {isOwner && (
              <>
                <div className="grid gap-2">
                  <Label>Privacy</Label>
                  <div className="grid grid-cols-3 gap-1 p-1 bg-muted/60 rounded-2xl text-xs font-medium mt-1">
                    {(
                      [
                        {
                          id: "private",
                          label: "Private",
                          icon: <LockKeyhole className="h-3.5 w-3.5" />,
                        },
                        {
                          id: "unlisted",
                          label: "Unlisted",
                          icon: <EyeOff className="h-3.5 w-3.5" />,
                        },
                        {
                          id: "public",
                          label: "Public",
                          icon: <Globe className="h-3.5 w-3.5" />,
                        },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSharePrivacy(opt.id)}
                        disabled={updateDeck.isPending}
                        className={cn(
                          "flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all",
                          sharePrivacy === opt.id
                            ? "bg-background text-foreground shadow-sm font-semibold"
                            : "text-muted-foreground hover:text-foreground",
                          updateDeck.isPending && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {opt.icon}
                        <span>{opt.label}</span>
                      </button>
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
              </>
            )}

            <div className="grid gap-2">
              <Label>Share Link</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={shareUrl}
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
              {isOwner ? "Cancel" : "Close"}
            </Button>
            {isOwner && (
              <Button type="submit" disabled={updateDeck.isPending}>
                {updateDeck.isPending ? "Saving..." : "Save Settings"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

