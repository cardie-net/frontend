import { useTranslations } from "next-intl"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useDeleteFolder } from "@/hooks/useFolders"

interface DeleteFolderDialogProps {
  folderId: string | null
  onClose: () => void
  onDeleted?: () => void
}

export function DeleteFolderDialog({
  folderId,
  onClose,
  onDeleted,
}: DeleteFolderDialogProps) {
  const t = useTranslations("Folders.deleteDialog")
  const tCommon = useTranslations("Common")
  const deleteFolder = useDeleteFolder()

  const handleConfirm = () => {
    if (!folderId) return
    deleteFolder.mutate(folderId, {
      onSuccess: () => {
        onClose()
        onDeleted?.()
      },
    })
  }

  return (
    <ConfirmDialog
      open={!!folderId}
      onOpenChange={(open) => !open && onClose()}
      title={t("title")}
      description={t("description")}
      onConfirm={handleConfirm}
      isPending={deleteFolder.isPending}
      confirmText={tCommon("delete")}
    />
  )
}
