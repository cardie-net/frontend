export interface TextElement {
  type: "text"
  content: string
}

export interface ImageElement {
  type: "image"
  url: string
}

export type CardElement = TextElement | ImageElement

export interface FlashCard {
  id: string
  front: CardElement[]
  back: CardElement[]
  order: number
  deck_id: string
}

export interface Deck {
  id: string
  name: string
  slug: string
  type?: "deck"
  user_id?: string
  description?: string
  privacy?: "public" | "unlisted" | "private"
  properties?: {
    color?: string
  }
}

export interface SocialLinks {
  instagram?: string
  facebook?: string
  twitter?: string
  linkedin?: string
  youtube?: string
  tiktok?: string
  github?: string
  website?: string
}

/** The authenticated user (`GET /api/v1/users/me`) or a public profile. */
export interface UserProfile {
  id: string
  email: string
  is_guest: boolean
  is_active: boolean
  display_name: string
  username: string
  avatar_url?: string
  bio?: string
  social_links?: SocialLinks
}

export interface CardProgress {
  card_id: string
  box: number
}

export interface SRSCardProgress {
  card_id: string
  repetitions: number
  ease_factor: number
  interval: number
  due_date: string | null
  last_reviewed: string | null
}

export interface SRSDeckCounts {
  new_count: number
  learning_count: number
  review_count: number
}

export interface SRSStudyResponse {
  new_cards: SRSCardProgress[]
  learning_cards: SRSCardProgress[]
  review_cards: SRSCardProgress[]
}

export interface SRSReviewItem {
  card_id: string
  rating: number
}
