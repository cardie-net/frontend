import type { CardElement, ImageElement, TextElement } from '@/types';
import { apiFetch } from './api';

/** Joins the text elements of a card side into a plain-text preview string. */
export function getCardText(elements: CardElement[]): string {
  return elements
    .filter((el): el is TextElement => el.type === 'text')
    .map((el) => el.content)
    .join(' ');
}

/** Returns the single image element of a card side, if any. */
export function getCardImage(elements: CardElement[]): ImageElement | null {
  return elements.find((el): el is ImageElement => el.type === 'image') ?? null;
}

/** Builds the element list for a card side from markdown text + optional image (image first, shown separately). */
export function buildElements(markdown: string, imageUrl: string | null): CardElement[] {
  const elements: CardElement[] = [];
  if (imageUrl) elements.push({ type: 'image', url: imageUrl });
  elements.push({ type: 'text', content: markdown });
  return elements;
}

/**
 * Uploads an image file for a deck via
 * `POST /api/v1/decks/{deck_id}/images` (multipart) and returns the
 * resulting S3 URL.
 */
export async function uploadCardImage(deckId: string, file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await apiFetch(`/api/v1/decks/${deckId}/images`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    let detail = 'Failed to upload image';
    try {
      const data = await res.json();
      if (typeof data.detail === 'string') detail = data.detail;
    } catch {
      // Non-JSON error body — keep the default message.
    }
    throw new Error(detail);
  }

  const data = await res.json();
  return data.url as string;
}
