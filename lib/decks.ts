/**
 * Deck color palette. Single source of truth for the color options shown in
 * the create-deck dialog and the classes used to render a deck's accent.
 *
 * Keep the class names as full literal strings: Tailwind's scanner needs the
 * complete `border-t-*-500` tokens in source to keep them in the build.
 */
export const DECK_COLORS = [
  { id: "default", label: "Default (no color)" },
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

const DECK_BG_CLASSES: Record<Exclude<DeckColor, "default">, string> = {
  red: "bg-red-500",
  orange: "bg-orange-500",
  amber: "bg-amber-500",
  green: "bg-green-500",
  emerald: "bg-emerald-500",
  teal: "bg-teal-500",
  cyan: "bg-cyan-500",
  blue: "bg-blue-500",
  indigo: "bg-indigo-500",
  violet: "bg-violet-500",
  purple: "bg-purple-500",
  fuchsia: "bg-fuchsia-500",
  pink: "bg-pink-500",
  rose: "bg-rose-500",
}

/** Returns the top-border accent classes for a deck color ('' for default/unknown/hex). */
export function getDeckColorClass(color?: string | null): string {
  if (!color || color === "default" || color.startsWith("#")) return ""
  const colorClass = (DECK_COLOR_CLASSES as Record<string, string | undefined>)[
    color
  ]
  return colorClass ? `border-t-4 ${colorClass}` : ""
}

/** Returns inline style for top-border if color is a hex code */
export function getDeckColorStyle(color?: string | null): React.CSSProperties | undefined {
  if (color?.startsWith("#")) {
    return { borderTopWidth: '4px', borderTopColor: color }
  }
  return undefined
}

/** Returns the background color class for a deck color ('' for default/unknown/hex). */
export function getDeckBgColorClass(color?: string | null): string {
  if (!color || color === "default" || color.startsWith("#")) return "bg-muted"
  const colorClass = (DECK_BG_CLASSES as Record<string, string | undefined>)[
    color
  ]
  return colorClass || "bg-muted"
}
