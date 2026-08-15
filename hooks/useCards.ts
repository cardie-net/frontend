import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api"
import { queryKeys } from "@/lib/queryKeys"
import { FlashCard, CardElement } from "@/types"

export function useCards(deckId: string | undefined) {
  return useQuery<FlashCard[]>({
    queryKey: queryKeys.cards(deckId),
    queryFn: async () => {
      const res = await apiFetch(`/api/v1/decks/${deckId}/cards`)
      if (!res.ok) throw new Error("Failed to fetch cards")
      const data = await res.json()
      return data.sort((a: FlashCard, b: FlashCard) => a.order - b.order)
    },
    enabled: !!deckId,
  })
}

export function useCreateCard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      deckId,
      front,
      back,
    }: {
      deckId: string
      front: CardElement[]
      back: CardElement[]
    }) => {
      const res = await apiFetch(`/api/v1/decks/${deckId}/cards`, {
        method: "POST",
        body: JSON.stringify({ front, back }),
      })
      if (!res.ok) throw new Error("Failed to create card")
      return res.json() as Promise<FlashCard>
    },
    onSuccess: (newCard, { deckId }) => {
      queryClient.setQueryData(
        queryKeys.cards(deckId),
        (old: FlashCard[] | undefined) => (old ? [...old, newCard] : [newCard])
      )
    },
  })
}

export function useBatchCreateCards() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      deckId,
      cards,
    }: {
      deckId: string
      cards: { front: CardElement[]; back: CardElement[] }[]
    }) => {
      const res = await apiFetch(`/api/v1/decks/${deckId}/cards/batch`, {
        method: "POST",
        body: JSON.stringify({ cards }),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.detail || "Failed to batch create cards")
      }
      return res.json() as Promise<FlashCard[]>
    },
    onSuccess: (newCards, { deckId }) => {
      queryClient.setQueryData(
        queryKeys.cards(deckId),
        (old: FlashCard[] | undefined) =>
          old ? [...old, ...newCards] : newCards
      )
    },
  })
}

export function useUpdateCard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      deckId,
      cardId,
      front,
      back,
    }: {
      deckId: string
      cardId: string
      front: CardElement[]
      back: CardElement[]
    }) => {
      const res = await apiFetch(`/api/v1/decks/${deckId}/cards/${cardId}`, {
        method: "PATCH",
        body: JSON.stringify({ front, back }),
      })
      if (!res.ok) throw new Error("Failed to update card")
      return res.json() as Promise<FlashCard>
    },
    onSuccess: (updatedCard, { deckId }) => {
      queryClient.setQueryData(
        queryKeys.cards(deckId),
        (old: FlashCard[] | undefined) =>
          old ? old.map((c) => (c.id === updatedCard.id ? updatedCard : c)) : []
      )
    },
  })
}

export function useDeleteCard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      deckId,
      cardId,
    }: {
      deckId: string
      cardId: string
    }) => {
      const res = await apiFetch(`/api/v1/decks/${deckId}/cards/${cardId}`, {
        method: "DELETE",
      })
      if (!res.ok && res.status !== 204)
        throw new Error("Failed to delete card")
      return cardId
    },
    onSuccess: (deletedId, { deckId }) => {
      queryClient.setQueryData(
        queryKeys.cards(deckId),
        (old: FlashCard[] | undefined) =>
          old ? old.filter((c) => c.id !== deletedId) : []
      )
    },
  })
}

export function useReorderCards() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      deckId,
      orderedIds,
    }: {
      deckId: string
      orderedIds: string[]
    }) => {
      const res = await apiFetch(`/api/v1/decks/${deckId}/cards/reorder`, {
        method: "POST",
        body: JSON.stringify({
          card_ids: orderedIds,
        }),
      })
      if (!res.ok) throw new Error("Failed to reorder cards")
      return true
    },
    onMutate: async ({ deckId, orderedIds }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.cards(deckId) })
      const previousCards = queryClient.getQueryData<FlashCard[]>(
        queryKeys.cards(deckId)
      )

      if (previousCards) {
        // Create a map for O(1) lookup
        const cardMap = new Map(previousCards.map((c) => [c.id, c]))
        // Reorder based on new IDs
        const reordered = orderedIds
          .map((id, index) => {
            const card = cardMap.get(id)
            return card ? { ...card, order: index } : undefined
          })
          .filter(Boolean) as FlashCard[]

        queryClient.setQueryData(queryKeys.cards(deckId), reordered)
      }
      return { previousCards }
    },
    onError: (err, { deckId }, context) => {
      // Rollback
      if (context?.previousCards) {
        queryClient.setQueryData(queryKeys.cards(deckId), context.previousCards)
      }
    },
    onSettled: (data, error, { deckId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cards(deckId) })
    },
  })
}

export function useTransposeDeck() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ deckId }: { deckId: string }) => {
      const res = await apiFetch(`/api/v1/decks/${deckId}/transpose`, {
        method: "POST",
      })
      if (!res.ok) throw new Error("Failed to transpose deck")
      return true
    },
    onSuccess: (data, { deckId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cards(deckId) })
    },
  })
}
