import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useDeleteDeck } from "@/hooks/useDecks"

interface DeleteDeckDialogProps {
  deckId: string | null
  onClose: () => void
  onDeleted?: () => void
}

export function DeleteDeckDialog({ deckId, onClose, onDeleted }: DeleteDeckDialogProps) {
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
      title="Delete Deck"
      description="Are you sure you want to delete this deck? All cards will be permanently lost."
      onConfirm={handleConfirm}
      isPending={deleteDeck.isPending}
      confirmText="Delete"
    />
  )
}
