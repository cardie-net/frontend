import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Fisher–Yates shuffle. Returns a new array and is unbiased — unlike
 * `arr.sort(() => Math.random() - 0.5)`, which skews the distribution.
 */
export function shuffle<T>(input: readonly T[]): T[] {
  const arr = [...input]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = arr[i]
    arr[i] = arr[j]
    arr[j] = tmp
  }
  return arr
}

/**
 * Safely parse any ISO / date string into a Date object.
 * If the string has no timezone offset, it is treated as UTC from the server.
 */
export function parseDate(dateInput?: string | Date | null): Date | null {
  if (!dateInput) return null
  if (dateInput instanceof Date) {
    return isNaN(dateInput.getTime()) ? null : dateInput
  }
  let str = String(dateInput).trim()
  if (!str) return null

  // Replace space separator with T if in SQL format (YYYY-MM-DD HH:MM:SS)
  if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}/.test(str)) {
    str = str.replace(" ", "T")
  }

  // If no timezone indicator (Z, +HH:MM, -HH:MM) is present, treat as UTC
  if (!/Z|[+-]\d{2}(?::?\d{2})?$/i.test(str)) {
    str += "Z"
  }

  const date = new Date(str)
  return isNaN(date.getTime()) ? null : date
}

export function formatDate(dateString?: string | Date | null): string {
  const date = parseDate(dateString)
  if (!date) return ""
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date)
}

export function formatDateTime(dateString?: string | Date | null): string {
  const date = parseDate(dateString)
  if (!date) return ""
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}

export function formatRelativeTime(dateString?: string | Date | null): string {
  const date = parseDate(dateString)
  if (!date) return ""
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 0 || diffInSeconds < 60) {
    return "just now"
  }
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`
  }
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours}h ago`
  }
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    return `${diffInDays}d ago`
  }
  return formatDate(date)
}
