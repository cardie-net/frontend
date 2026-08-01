export interface CardElement {
  type: 'text';
  content: string;
}

export interface FlashCard {
  id: string;
  front: CardElement[];
  back: CardElement[];
  order: number;
  deck_id: string;
}

export interface Deck {
  id: string;
  name: string;
  slug: string;
  type?: 'deck';
  user_id?: string;
  privacy?: 'public' | 'unlisted' | 'private' | string;
  properties?: {
    color?: string;
  };
}

export interface CardProgress {
  card_id: string;
  box: number;
}

export interface SRSCardProgress {
  card_id: string;
  repetitions: number;
  ease_factor: number;
  interval: number;
  due_date: string | null;
  last_reviewed: string | null;
}

export interface SRSDeckCounts {
  new_count: number;
  learning_count: number;
  review_count: number;
}

export interface SRSStudyResponse {
  new_cards: SRSCardProgress[];
  learning_cards: SRSCardProgress[];
  review_cards: SRSCardProgress[];
}

export interface SRSReviewItem {
  card_id: string;
  rating: number;
}
