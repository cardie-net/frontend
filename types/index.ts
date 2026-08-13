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
  folder_id?: string | null
  privacy?: "public" | "unlisted" | "private"
  properties?: {
    color?: string
    description?: string
    cover_image_url?: string
  }
  cards_count?: number
}

export interface Folder {
  id: string
  name: string
  slug: string
  type: "folder"
  user_id: string
  parent_id?: string | null
  privacy?: "public" | "unlisted" | "private"
  properties?: {
    color?: string
    description?: string
    cover_image_url?: string
  }
}

export type UserItem = (Folder & { type: "folder" }) | (Deck & { type?: "deck" })

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

export interface UserPreferences {
  language?: string
  themeConfig?: Record<string, unknown>
  learning_multiple_choice?: boolean
  overview_shuffle?: boolean
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
  preferences?: UserPreferences
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
  activated: boolean
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

export interface UserDailyActivity {
  id: string
  user_id: string
  date: string
  points: number
  activities_count: number
  details?: Record<string, number> | null
}

export interface UserActivitySummary {
  activities: UserDailyActivity[]
  total_points: number
  current_streak: number
  longest_streak: number
  total_active_days: number
}

