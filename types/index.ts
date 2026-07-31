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
