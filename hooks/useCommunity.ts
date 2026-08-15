import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api"
import { queryKeys } from "@/lib/queryKeys"
import {
  CommunityItem,
  CommunityResponse,
  StarResponse,
  UserStarredResponse,
} from "@/types"
import { useAuth } from "@/lib/AuthContext"

interface UseCommunityParams {
  item_type?: "all" | "deck" | "folder"
  sort?: "popular" | "created" | "updated" | "search"
  q?: string
  page?: number
  limit?: number
}

export function useCommunityItems(params: UseCommunityParams = {}) {
  const { item_type = "all", sort = "popular", q, page = 1, limit = 20 } = params

  return useQuery<CommunityResponse>({
    queryKey: queryKeys.community({ item_type, sort, q, page, limit }),
    queryFn: async () => {
      const searchParams = new URLSearchParams()
      if (item_type) searchParams.set("item_type", item_type)
      if (sort) searchParams.set("sort", sort)
      if (q && q.trim()) searchParams.set("q", q.trim())
      if (page) searchParams.set("page", page.toString())
      if (limit) searchParams.set("limit", limit.toString())

      const res = await apiFetch(`/api/v1/community?${searchParams.toString()}`)
      if (!res.ok) {
        throw new Error("Failed to fetch community items")
      }
      return res.json()
    },
  })
}

export function useUserStarred() {
  const { user } = useAuth()

  return useQuery<UserStarredResponse>({
    queryKey: queryKeys.userStarred(),
    queryFn: async () => {
      const res = await apiFetch("/api/v1/community/starred")
      if (!res.ok) {
        throw new Error("Failed to fetch starred items")
      }
      return res.json()
    },
    enabled: !!user && !user.is_guest,
  })
}

export function useUserFavorites() {
  const { user } = useAuth()

  return useQuery<CommunityItem[]>({
    queryKey: queryKeys.userFavorites(),
    queryFn: async () => {
      const res = await apiFetch("/api/v1/community/favorites")
      if (!res.ok) {
        throw new Error("Failed to fetch favorite items")
      }
      return res.json()
    },
    enabled: !!user && !user.is_guest,
  })
}

export function useStarDeck() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (deckId: string): Promise<StarResponse> => {
      const res = await apiFetch(`/api/v1/decks/${deckId}/star`, {
        method: "POST",
      })
      if (!res.ok) {
        throw new Error("Failed to star deck")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community"] })
      queryClient.invalidateQueries({ queryKey: queryKeys.userStarred() })
      queryClient.invalidateQueries({ queryKey: queryKeys.userFavorites() })
      queryClient.invalidateQueries({ queryKey: ["deck"] })
    },
  })
}

export function useUnstarDeck() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (deckId: string): Promise<StarResponse> => {
      const res = await apiFetch(`/api/v1/decks/${deckId}/star`, {
        method: "DELETE",
      })
      if (!res.ok) {
        throw new Error("Failed to unstar deck")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community"] })
      queryClient.invalidateQueries({ queryKey: queryKeys.userStarred() })
      queryClient.invalidateQueries({ queryKey: queryKeys.userFavorites() })
      queryClient.invalidateQueries({ queryKey: ["deck"] })
    },
  })
}

export function useStarFolder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (folderId: string): Promise<StarResponse> => {
      const res = await apiFetch(`/api/v1/folders/${folderId}/star`, {
        method: "POST",
      })
      if (!res.ok) {
        throw new Error("Failed to star folder")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community"] })
      queryClient.invalidateQueries({ queryKey: queryKeys.userStarred() })
      queryClient.invalidateQueries({ queryKey: queryKeys.userFavorites() })
      queryClient.invalidateQueries({ queryKey: ["folder-by-slug"] })
      queryClient.invalidateQueries({ queryKey: ["folder"] })
    },
  })
}

export function useUnstarFolder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (folderId: string): Promise<StarResponse> => {
      const res = await apiFetch(`/api/v1/folders/${folderId}/star`, {
        method: "DELETE",
      })
      if (!res.ok) {
        throw new Error("Failed to unstar folder")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community"] })
      queryClient.invalidateQueries({ queryKey: queryKeys.userStarred() })
      queryClient.invalidateQueries({ queryKey: queryKeys.userFavorites() })
      queryClient.invalidateQueries({ queryKey: ["folder-by-slug"] })
      queryClient.invalidateQueries({ queryKey: ["folder"] })
    },
  })
}
