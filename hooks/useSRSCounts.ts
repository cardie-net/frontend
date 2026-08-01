import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { SRSDeckCounts } from '@/types';

export function useSRSCounts() {
  const { user } = useAuth();
  return useQuery<Record<string, SRSDeckCounts>>({
    queryKey: ['srs-counts', user?.id],
    queryFn: async () => {
      const res = await apiFetch('/api/v1/srs/counts');
      if (!res.ok) throw new Error('Failed to fetch SRS counts');
      return res.json();
    },
    enabled: !!user && !user.is_guest,
  });
}
