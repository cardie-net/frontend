import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { Deck } from '@/types';
import { useAuth } from '@/lib/AuthContext';

export function useDecks() {
  const { user } = useAuth();
  
  return useQuery<Deck[]>({
    queryKey: ['decks', user?.id],
    queryFn: async () => {
      const res = await apiFetch(`/api/v1/users/${user?.id}/items`);
      if (!res.ok) throw new Error('Failed to fetch items');
      const data = await res.json();
      return data.filter((item: { type: string }) => item.type === 'deck');
    },
    enabled: !!user && !user.is_guest,
  });
}

export function useDeck(username: string, deckSlug: string) {
  return useQuery<Deck>({
    queryKey: ['deck', username, deckSlug],
    queryFn: async () => {
      const res = await apiFetch(`/api/v1/users/profile/${username}/decks/${deckSlug}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error('Deck not found');
        if (res.status === 403) throw new Error('You do not have permission to view this deck');
        throw new Error('Failed to load deck');
      }
      return res.json();
    },
    enabled: !!username && !!deckSlug,
  });
}

export function useDeleteDeck() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (deckId: string) => {
      const res = await apiFetch(`/api/v1/decks/${deckId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete deck');
      return deckId;
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData(['decks', user?.id], (old: Deck[] | undefined) => 
        old ? old.filter(deck => deck.id !== deletedId) : []
      );
    }
  });
}
