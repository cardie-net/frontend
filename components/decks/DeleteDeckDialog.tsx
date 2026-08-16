import { useTranslations } from "next-intl"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useDeleteDeck } from "@/hooks/useDecks"

interface DeleteDeckDialogProps {
  deckId: string | null
  onClose: () => void
  onDeleted?: () => void
}

export function DeleteDeckDialog({ deckId, onClose, onDeleted }: DeleteDeckDialogProps) {
  const t = useTranslations("Decks.deleteDialog")
  const tCommon = useTranslations("Common")
  const deleteDeck = useDeleteDeck()

  const handleConfirm = () => {
    if (!deckId) return
    deleteDeck.mutate(deckId, {
      onSuccess: () => {
        onClose()
        onDeleted?.()
      }
    })
  }

  return (
    <ConfirmDialog
      open={!!deckId}
      onOpenChange={(open) => !open && onClose()}
      title={t("title")}
      description={t("description")}
      onConfirm={handleConfirm}
      isPending={deleteDeck.isPending}
      confirmText={tCommon("delete")}
    />
  )
}
