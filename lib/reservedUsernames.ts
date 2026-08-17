import reservedList from "./reserved_usernames.json"

export const RESERVED_USERNAMES: ReadonlySet<string> = new Set(reservedList)

export function isReservedUsername(username: string): boolean {
  if (!username) return false
  const normalized = username.trim().toLowerCase()
  return (
    RESERVED_USERNAMES.has(normalized) ||
    RESERVED_USERNAMES.has(normalized.replace(/-/g, "_")) ||
    RESERVED_USERNAMES.has(normalized.replace(/_/g, "-"))
  )
}
