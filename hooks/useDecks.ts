import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api"
import { queryKeys } from "@/lib/queryKeys"
import { Deck } from "@/types"
import { useAuth } from "@/lib/AuthContext"

export function useDecks() {
  const { user } = useAuth()

  return useQuery<Deck[]>({
    queryKey: queryKeys.decks(user?.id),
    queryFn: async () => {
      const res = await apiFetch(`/api/v1/users/${user?.id}/items`)
      if (!res.ok) throw new Error("Failed to fetch items")
      const data = await res.json()
      return data.filter((item: { type: string }) => item.type === "deck")
    },
    enabled: !!user && !user.is_guest,
    // The deck-list cache is kept in sync by the create/update/delete mutations.
  })
}

export function useDeck(username: string, deckSlug: string) {
  return useQuery<Deck>({
    queryKey: queryKeys.deck(username, deckSlug),
    queryFn: async () => {
      const res = await apiFetch(
        `/api/v1/users/profile/${username}/decks/${deckSlug}`
      )
      if (!res.ok) {
        if (res.status === 404) throw new Error("Deck not found")
        if (res.status === 403)
          throw new Error("You do not have permission to view this deck")
        throw new Error("Failed to load deck")
      }
      return res.json()
    },
    enabled: !!username && !!deckSlug,
  })
}

export function useCreateDeck() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({
      name,
      color,
      folderId,
      description,
      coverImageUrl,
    }: {
      name: string
      color: string
      folderId?: string | null
      description?: string
      coverImageUrl?: string | null
    }): Promise<Deck> => {
      const properties: Record<string, unknown> = {
        color: color === "default" ? null : color,
      }
      if (description) {
        properties.description = description
      }
      if (coverImageUrl) {
        properties.cover_image_url = coverImageUrl
      }
      const res = await apiFetch("/api/v1/decks", {
        method: "POST",
        body: JSON.stringify({
          name,
          privacy: "private",
          folder_id: folderId || null,
          properties,
        }),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.detail || "Failed to create deck")
      }
      return res.json()
    },
    onSuccess: (newDeck) => {
      queryClient.setQueryData(
        queryKeys.decks(user?.id),
        (old: Deck[] | undefined) => (old ? [...old, newDeck] : [newDeck])
      )
      queryClient.invalidateQueries({ queryKey: queryKeys.userItems(user?.id) })
      if (newDeck.folder_id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.folderItems(newDeck.folder_id),
        })
      }
    },
  })
}

export function useUpdateDeck() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({
      deckId,
      privacy,
      slug,
      folderId,
      name,
      description,
      color,
      coverImageUrl,
    }: {
      deckId: string
      privacy?: string
      slug?: string
      folderId?: string | null
      name?: string
      description?: string
      color?: string | null
      coverImageUrl?: string | null
    }): Promise<Deck> => {
      const body: Record<string, unknown> = {}
      if (privacy !== undefined) body.privacy = privacy
      if (slug !== undefined) body.slug = slug
      if (folderId !== undefined) body.folder_id = folderId
      if (name !== undefined) body.name = name

      const properties: Record<string, unknown> = {}
      if (description !== undefined) properties.description = description
      if (color !== undefined) properties.color = color === "default" ? null : color
      if (coverImageUrl !== undefined) properties.cover_image_url = coverImageUrl
      if (Object.keys(properties).length > 0) body.properties = properties

      const res = await apiFetch(`/api/v1/decks/${deckId}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.detail || "Failed to update deck")
      }
      return res.json()
    },
    onSuccess: (updatedDeck) => {
      queryClient.setQueryData(
        queryKeys.decks(user?.id),
        (old: Deck[] | undefined) =>
          old
            ? old.map((deck) =>
                deck.id === updatedDeck.id ? updatedDeck : deck
              )
            : []
      )
      queryClient.invalidateQueries({ queryKey: queryKeys.userItems(user?.id) })
      queryClient.invalidateQueries({ queryKey: ["folder-items"] })
      queryClient.invalidateQueries({ queryKey: ["deck"] })
    },
  })
}

export function useDeleteDeck() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (deckId: string) => {
      const res = await apiFetch(`/api/v1/decks/${deckId}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete deck")
      return deckId
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData(
        queryKeys.decks(user?.id),
        (old: Deck[] | undefined) =>
          old ? old.filter((deck) => deck.id !== deletedId) : []
      )
      queryClient.invalidateQueries({ queryKey: queryKeys.userItems(user?.id) })
      queryClient.invalidateQueries({ queryKey: ["folder-items"] })
    },
  })
}

export function useUploadDeckCover() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({
      deckId,
      file,
    }: {
      deckId: string
      file: File
    }): Promise<Deck> => {
      const formData = new FormData()
      formData.append("file", file)

      const res = await apiFetch(`/api/v1/decks/${deckId}/cover`, {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.detail || "Failed to upload cover image")
      }
      return res.json()
    },
    onSuccess: (updatedDeck) => {
      queryClient.setQueryData(
        queryKeys.decks(user?.id),
        (old: Deck[] | undefined) =>
          old
            ? old.map((deck) =>
                deck.id === updatedDeck.id ? updatedDeck : deck
              )
            : []
      )
      queryClient.invalidateQueries({ queryKey: queryKeys.userItems(user?.id) })
      queryClient.invalidateQueries({ queryKey: ["folder-items"] })
      queryClient.invalidateQueries({ queryKey: ["deck"] })
    },
  })
}
