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
      title="Delete Folder"
      description="Are you sure you want to delete this folder AND ALL ITS CONTENTS? This action cannot be undone."
      onConfirm={handleConfirm}
      isPending={deleteFolder.isPending}
      confirmText="Delete"
    />
  )
}
