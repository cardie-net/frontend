"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { Share2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { buttonVariants } from "@/components/ui/button"

interface GuestShareDialogProps {
  open: boolean
  onClose: () => void
}

export function GuestShareDialog({ open, onClose }: GuestShareDialogProps) {
  const t = useTranslations("GuestShareDialog")

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader className="flex flex-row items-center gap-3 space-y-0 text-left">
          <div className="rounded-2xl bg-primary/10 p-2 text-primary">
            <Share2 className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="text-base font-semibold">
              {t("title")}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {t("title")}
            </DialogDescription>
          </div>
        </DialogHeader>
        <div className="py-2 text-sm leading-relaxed text-muted-foreground">
          <p>
            {t.rich("description", {
              link: (chunks) => (
                <Link
                  href="/signup"
                  className="font-semibold text-foreground underline underline-offset-4 transition-opacity hover:opacity-80"
                >
                  {chunks}
                </Link>
              ),
            })}
          </p>
        </div>
        <DialogFooter>
          <button
            type="button"
            onClick={onClose}
            className={buttonVariants({ variant: "outline" })}
          >
            {t("close")}
          </button>
          <Link href="/signup" className={buttonVariants()}>
            {t("signUp")}
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
