"use client"

import { useState } from "react"
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
import { LockKeyhole, EyeOff, Globe, Copy, Check, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Folder } from "@/types"
import { useAuth } from "@/lib/AuthContext"
import { useUpdateFolder } from "@/hooks/useFolders"

interface ShareFolderDialogProps {
  folder: Folder | null
  username?: string
  onClose: () => void
}

export function ShareFolderDialog({
  folder,
  username,
  onClose,
}: ShareFolderDialogProps) {
  const t = useTranslations("Folders.shareDialog")
  const tCommon = useTranslations("Common")
  const { user } = useAuth()
  const updateFolder = useUpdateFolder()

  const [sharePrivacy, setSharePrivacy] = useState(folder?.privacy || "private")
  const [shareSlug, setShareSlug] = useState(folder?.slug || "")
  const [shareError, setShareError] = useState("")
  const [isLinkCopied, setIsLinkCopied] = useState(false)

  const isOwner = !!(
    user &&
    folder &&
    (!folder.user_id || user.id === folder.user_id)
  )
  const ownerUsername = folder?.owner?.username || username || user?.username

  const handleSaveShare = async (e: React.FormEvent) => {
    e.preventDefault()
    setShareError("")

    if (!isOwner) {
      onClose()
      return
    }

    if (!/^[a-z0-9-]+$/.test(shareSlug)) {
      setShareError(t("invalidSlug"))
      return
    }

    if (!folder) return

    updateFolder.mutate(
      {
        folderId: folder.id,
        privacy: sharePrivacy,
        slug: shareSlug,
      },
      {
        onSuccess: () => onClose(),
        onError: (err) =>
          setShareError(err instanceof Error ? err.message : tCommon("error")),
      }
    )
  }

  const handleCopyLink = () => {
    const ownerName =
      folder?.owner?.username || username || user?.username || ""
    navigator.clipboard.writeText(
      `${window.location.origin}/${ownerName}/${shareSlug || folder?.slug || folder?.id}`
    )
    setIsLinkCopied(true)
    setTimeout(() => setIsLinkCopied(false), 2000)
  }

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/${ownerUsername || ""}/${shareSlug || folder?.slug || folder?.id}`
      : ""

  return (
    <Dialog
      open={!!folder}
      onOpenChange={(open) => !updateFolder.isPending && !open && onClose()}
    >
      <DialogContent>
        <form onSubmit={handleSaveShare}>
          <DialogHeader className="flex flex-row items-center gap-3 space-y-0 text-left">
            <div className="rounded-2xl bg-primary/10 p-2 text-primary">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                {isOwner ? t("titleOwner") : t("titleViewer")}
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-xs text-muted-foreground">
                {isOwner ? t("descOwner") : t("descViewer")}
              </DialogDescription>
            </div>
          </DialogHeader>
          <div className="grid gap-4 px-1 py-4">
            {shareError && <Alert variant="destructive">{shareError}</Alert>}

            {isOwner && (
              <>
                <div className="grid gap-2">
                  <Label>{t("privacyLabel")}</Label>
                  <div className="mt-1 grid grid-cols-3 gap-1 rounded-2xl bg-muted/60 p-1 text-xs font-medium">
                    {(
                      [
                        {
                          id: "private",
                          label: t("privacyPrivate"),
                          icon: <LockKeyhole className="h-3.5 w-3.5" />,
                        },
                        {
                          id: "unlisted",
                          label: t("privacyUnlisted"),
                          icon: <EyeOff className="h-3.5 w-3.5" />,
                        },
                        {
                          id: "public",
                          label: t("privacyPublic"),
                          icon: <Globe className="h-3.5 w-3.5" />,
                        },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSharePrivacy(opt.id)}
                        disabled={updateFolder.isPending}
                        className={cn(
                          "flex items-center justify-center gap-1.5 rounded-xl py-2 transition-all",
                          sharePrivacy === opt.id
                            ? "bg-background font-semibold text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground",
                          updateFolder.isPending &&
                            "cursor-not-allowed opacity-50"
                        )}
                      >
                        {opt.icon}
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>{t("slugLabel")}</Label>
                  <Input
                    value={shareSlug}
                    onChange={(e) => setShareSlug(e.target.value)}
                    maxLength={50}
                    disabled={updateFolder.isPending}
                    required
                    className="font-mono"
                  />
                </div>
              </>
            )}

            <div className="grid gap-2">
              <Label>{t("shareLinkLabel")}</Label>
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
              disabled={updateFolder.isPending}
            >
              {isOwner ? tCommon("cancel") : tCommon("close")}
            </Button>
            {isOwner && (
              <Button type="submit" disabled={updateFolder.isPending}>
                {updateFolder.isPending ? tCommon("saving") : tCommon("save")}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
