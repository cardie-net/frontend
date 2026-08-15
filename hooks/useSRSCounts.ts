import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api"
import { queryKeys } from "@/lib/queryKeys"
import { useAuth } from "@/lib/AuthContext"
import { SRSDeckCounts } from "@/types"

export function useSRSCounts() {
  const { user } = useAuth()
  return useQuery<Record<string, SRSDeckCounts>>({
    queryKey: queryKeys.srsCounts(user?.id),
    queryFn: async () => {
      const res = await apiFetch("/api/v1/srs/counts")
      if (!res.ok) throw new Error("Failed to fetch SRS counts")
      return res.json()
    },
    enabled: !!user,
    // SRS counts change after every session, so the /decks page badge row must
    // refetch whenever it mounts (targeted override; other queries use the
    // default staleTime).
    refetchOnMount: "always",
  })
}

export function useActivateSRS() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (deckId: string) => {
      const res = await apiFetch(`/api/v1/decks/${deckId}/srs/activate`, {
        method: "POST",
      })
      if (!res.ok) throw new Error("Failed to activate SRS")
      return res.json() as Promise<SRSDeckCounts>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.srsCounts(user?.id),
      })
    },
  })
}

