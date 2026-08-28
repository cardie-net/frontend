/**
 * Calculates Levenshtein edit distance between two strings.
 */
export function levenshteinDistance(s1: string, s2: string): number {
  if (s1 === s2) return 0
  if (!s1) return s2.length
  if (!s2) return s1.length

  if (s1.length < s2.length) {
    const tmp = s1
    s1 = s2
    s2 = tmp
  }

  let previousRow = Array.from({ length: s2.length + 1 }, (_, i) => i)
  for (let i = 0; i < s1.length; i++) {
    const currentRow = [i + 1]
    for (let j = 0; j < s2.length; j++) {
      const insertions = previousRow[j + 1] + 1
      const deletions = currentRow[j] + 1
      const substitutions = previousRow[j] + (s1[i] !== s2[j] ? 1 : 0)
      currentRow.push(Math.min(insertions, deletions, substitutions))
    }
    previousRow = currentRow
  }

  return previousRow[s2.length]
}

/**
 * Calculates normalized similarity between two words (0.0 to 1.0).
 */
export function wordSimilarity(w1: string, w2: string): number {
  if (!w1 || !w2) return 0
  if (w1 === w2) return 1
  if (w1.includes(w2) || w2.includes(w1)) {
    return Math.min(w1.length, w2.length) / Math.max(w1.length, w2.length)
  }
  const maxLen = Math.max(w1.length, w2.length)
  const dist = levenshteinDistance(w1, w2)
  return Math.max(0, 1 - dist / maxLen)
}

export interface SearchableItem {
  name: string
  properties?: {
    description?: string
    color?: string
    cover_image_url?: string
  } | null
  owner?: {
    username?: string
    display_name?: string
    id?: string
    avatar_url?: string
    is_guest?: boolean
  } | null
}

/**
 * Checks whether an item matches a search query against its name, description,
 * creator username, and creator display name (with exact, substring, multi-token, and fuzzy matching).
 */
export function matchItemQuery(
  item: SearchableItem,
  query: string,
  threshold = 0.6
): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true

  const nameLower = (item.name || "").trim().toLowerCase()
  const descLower = (item.properties?.description || "").trim().toLowerCase()
  const userLower = (item.owner?.username || "").trim().toLowerCase()
  const dispLower = (item.owner?.display_name || "").trim().toLowerCase()

  // 1. Exact or substring match in any field
  if (
    nameLower.includes(q) ||
    descLower.includes(q) ||
    userLower.includes(q) ||
    dispLower.includes(q)
  ) {
    return true
  }

  // 2. Full field similarity
  if (
    wordSimilarity(q, nameLower) >= threshold ||
    wordSimilarity(q, userLower) >= threshold ||
    wordSimilarity(q, dispLower) >= threshold ||
    wordSimilarity(q, descLower) >= threshold
  ) {
    return true
  }

  // Tokenization for words
  const tokenize = (str: string) =>
    str
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .filter(Boolean)

  const nameWords = tokenize(nameLower)
  const userWords = tokenize(userLower)
  const dispWords = tokenize(dispLower)
  const descWords = tokenize(descLower)
  const allWords = [...nameWords, ...userWords, ...dispWords, ...descWords]

  const queryWords = tokenize(q)
  if (queryWords.length === 0) return true

  // Single word query check against all words
  if (queryWords.length === 1) {
    return allWords.some((word) => wordSimilarity(q, word) >= threshold)
  }

  // Multi-token matching: each query token must have a fuzzy match in at least one word
  return queryWords.every((qToken) => {
    return allWords.some((word) => wordSimilarity(qToken, word) >= threshold)
  })
}
