import { useQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api"
import { queryKeys } from "@/lib/queryKeys"
import { useAuth } from "@/lib/AuthContext"
import { UserActivitySummary } from "@/types"

export function useUserActivity(days: number = 365) {
  const { user } = useAuth()

  return useQuery<UserActivitySummary>({
    queryKey: [...queryKeys.userActivity(user?.id), days],
    queryFn: async () => {
      const res = await apiFetch(`/api/v1/users/me/activity?days=${days}`)
      if (!res.ok) throw new Error("Failed to fetch user activity history")
      return res.json()
    },
    enabled: !!user && !user.is_guest,
    staleTime: 60_000,
  })
}
