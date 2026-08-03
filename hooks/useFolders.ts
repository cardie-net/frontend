import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api"
import { queryKeys } from "@/lib/queryKeys"
import { Folder, UserItem } from "@/types"
import { useAuth } from "@/lib/AuthContext"

export function useUserItems(userId?: string) {
  const { user } = useAuth()
  const targetUserId = userId || user?.id

  return useQuery<UserItem[]>({
    queryKey: queryKeys.userItems(targetUserId),
    queryFn: async () => {
      const res = await apiFetch(`/api/v1/users/${targetUserId}/items`)
      if (!res.ok) throw new Error("Failed to fetch items")
      return res.json()
    },
    enabled: !!targetUserId && !(user && targetUserId === user.id && user.is_guest),
  })
}

export function useFolder(folderId?: string) {
  return useQuery<Folder>({
    queryKey: queryKeys.folder(folderId),
    queryFn: async () => {
      const res = await apiFetch(`/api/v1/folders/${folderId}`)
      if (!res.ok) {
        if (res.status === 404) throw new Error("Folder not found")
        if (res.status === 403)
          throw new Error("You do not have permission to view this folder")
        throw new Error("Failed to load folder")
      }
      return res.json()
    },
    enabled: !!folderId,
  })
}

export function useFolderItems(folderId?: string) {
  return useQuery<UserItem[]>({
    queryKey: queryKeys.folderItems(folderId),
    queryFn: async () => {
      const res = await apiFetch(`/api/v1/folders/${folderId}/items`)
      if (!res.ok) {
        if (res.status === 404) throw new Error("Folder not found")
        if (res.status === 403) throw new Error("Permission denied")
        throw new Error("Failed to fetch folder items")
      }
      return res.json()
    },
    enabled: !!folderId,
  })
}

export function useCreateFolder() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({
      name,
      color,
      privacy = "private",
      slug,
      parentId,
    }: {
      name: string
      color?: string
      privacy?: "public" | "unlisted" | "private"
      slug?: string
      parentId?: string | null
    }): Promise<Folder> => {
      const body: Record<string, unknown> = {
        name,
        privacy,
        parent_id: parentId || null,
      }
      if (slug && slug.trim()) {
        body.slug = slug.trim()
      }
      if (color !== undefined) {
        body.properties = { color: color === "default" ? null : color }
      }

      const res = await apiFetch("/api/v1/folders", {
        method: "POST",
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.detail || "Failed to create folder")
      }
      return res.json()
    },
    onSuccess: (newFolder) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userItems(user?.id) })
      if (newFolder.parent_id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.folderItems(newFolder.parent_id),
        })
      }
    },
  })
}

export function useUpdateFolder() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({
      folderId,
      name,
      slug,
      privacy,
      parentId,
      color,
    }: {
      folderId: string
      name?: string
      slug?: string
      privacy?: "public" | "unlisted" | "private"
      parentId?: string | null
      color?: string | null
    }): Promise<Folder> => {
      const body: Record<string, unknown> = {}
      if (name !== undefined) body.name = name
      if (slug !== undefined) body.slug = slug
      if (privacy !== undefined) body.privacy = privacy
      if (parentId !== undefined) body.parent_id = parentId
      if (color !== undefined) {
        body.properties = { color: color === "default" ? null : color }
      }

      const res = await apiFetch(`/api/v1/folders/${folderId}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.detail || "Failed to update folder")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userItems(user?.id) })
      queryClient.invalidateQueries({ queryKey: ["folder-items"] })
    },
  })
}

export function useDeleteFolder() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (folderId: string) => {
      const res = await apiFetch(`/api/v1/folders/${folderId}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete folder")
      return folderId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userItems(user?.id) })
      queryClient.invalidateQueries({ queryKey: ["folder-items"] })
    },
  })
}
