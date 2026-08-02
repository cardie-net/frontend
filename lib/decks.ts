/**
 * Deck color palette. Single source of truth for the color options shown in
 * the create-deck dialog and the classes used to render a deck's accent.
 *
 * Keep the class names as full literal strings: Tailwind's scanner needs the
 * complete `border-t-*-500` tokens in source to keep them in the build.
 */
export const DECK_COLORS = [
  { id: "default", label: "Default (Theme)" },
  { id: "red", label: "Red" },
  { id: "orange", label: "Orange" },
  { id: "amber", label: "Amber" },
  { id: "green", label: "Green" },
  { id: "emerald", label: "Emerald" },
  { id: "teal", label: "Teal" },
  { id: "cyan", label: "Cyan" },
  { id: "blue", label: "Blue" },
  { id: "indigo", label: "Indigo" },
  { id: "violet", label: "Violet" },
  { id: "purple", label: "Purple" },
  { id: "fuchsia", label: "Fuchsia" },
  { id: "pink", label: "Pink" },
  { id: "rose", label: "Rose" },
] as const

export type DeckColor = (typeof DECK_COLORS)[number]["id"]

// Exhaustiveness enforced by the Record type: TS errors if a non-default color
// id is missing here (or an extra key is added).
const DECK_COLOR_CLASSES: Record<Exclude<DeckColor, "default">, string> = {
  red: "border-t-red-500",
  orange: "border-t-orange-500",
  amber: "border-t-amber-500",
  green: "border-t-green-500",
  emerald: "border-t-emerald-500",
  teal: "border-t-teal-500",
  cyan: "border-t-cyan-500",
  blue: "border-t-blue-500",
  indigo: "border-t-indigo-500",
  violet: "border-t-violet-500",
  purple: "border-t-purple-500",
  fuchsia: "border-t-fuchsia-500",
  pink: "border-t-pink-500",
  rose: "border-t-rose-500",
}

/** Returns the top-border accent classes for a deck color ('' for default/unknown). */
export function getDeckColorClass(color?: string | null): string {
  if (!color || color === "default") return ""
  const colorClass = (DECK_COLOR_CLASSES as Record<string, string | undefined>)[
    color
  ]
  return colorClass ? `border-t-4 ${colorClass}` : ""
}
