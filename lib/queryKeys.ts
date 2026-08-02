/**
 * Centralized React Query keys. Keep every cache key in one place so hooks
 * and pages that read/write the same data can't drift apart.
 */
export const queryKeys = {
  decks: (userId?: string) => ["decks", userId] as const,
  deck: (username: string, deckSlug: string) =>
    ["deck", username, deckSlug] as const,
  cards: (deckId?: string) => ["cards", deckId] as const,
  srsCounts: (userId?: string) => ["srs-counts", userId] as const,
  profile: (username: string) => ["profile", username] as const,
  userDecks: (userId?: string) => ["user-decks", userId] as const,
}
