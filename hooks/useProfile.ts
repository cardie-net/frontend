import { useQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api"
import { queryKeys } from "@/lib/queryKeys"
import { Deck, UserProfile, UserItem } from "@/types"

/** Public profile for a username (`GET /api/v1/users/profile/{username}`). */
export function useProfile(username: string) {
  return useQuery<UserProfile>({
    queryKey: queryKeys.profile(username),
    queryFn: async () => {
      const res = await apiFetch(`/api/v1/users/profile/${username}`)
      if (!res.ok) {
        if (res.status === 404) throw new Error("User not found")
        throw new Error("Failed to load profile")
      }
      return res.json()
    },
    enabled: !!username,
  })
}

/**
 * The items of an arbitrary user (`GET /api/v1/users/{userId}/items`),
 * filtered to entries that have a slug. Used for public profiles.
 */
export function useProfileItems(userId: string | undefined) {
  return useQuery<UserItem[]>({
    queryKey: queryKeys.userDecks(userId),
    queryFn: async () => {
      const res = await apiFetch(`/api/v1/users/${userId}/items`)
      if (!res.ok) throw new Error("Failed to load items")
      const data = await res.json()
      return data.filter((item: { slug?: string }) => "slug" in item)
    },
    enabled: !!userId,
  })
}
