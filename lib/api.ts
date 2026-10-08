let guestAuthPromise: Promise<boolean> | null = null

async function setupGuestSession(): Promise<boolean> {
  if (guestAuthPromise) {
    return guestAuthPromise
  }

  const attempt = (async () => {
    try {
      const response = await fetch("/api/v1/auth/guest", {
        method: "POST",
        headers: {
          accept: "application/json",
        },
      })

      return response.ok
    } catch (error) {
      console.error("Error setting up guest session:", error)
      return false
    }
  })()

  // Concurrent 401s share the in-flight attempt. Once it settles we drop the
  // reference so a later 401 retries from scratch (and a failed attempt isn't
  // memoized forever). A successful guest session persists via its cookie.
  guestAuthPromise = attempt.finally(() => {
    guestAuthPromise = null
  })

  return guestAuthPromise
}

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  // Do not automatically setup guest session for auth endpoints
  const isAuthEndpoint = endpoint.includes("/api/v1/auth/")

  const headers = new Headers(options.headers || {})

  if (
    !headers.has("Content-Type") &&
    options.method &&
    options.method !== "GET"
  ) {
    // Only set application/json if not FormData or URLSearchParams
    if (typeof window !== "undefined" && options.body instanceof FormData) {
      // Do not set Content-Type for FormData
    } else if (
      typeof window !== "undefined" &&
      options.body instanceof URLSearchParams
    ) {
      // Do not set Content-Type for URLSearchParams if already handled, though usually it defaults to application/x-www-form-urlencoded
    } else {
      headers.set("Content-Type", "application/json")
    }
  }

  // Ensure cookies are included
  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: "include", // Important for sending/receiving httpOnly cookies
  }

  let response = await fetch(endpoint, fetchOptions)

  if (
    response.status === 401 &&
    !isAuthEndpoint &&
    typeof window !== "undefined"
  ) {
    const guestSetupSuccess = await setupGuestSession()
    if (guestSetupSuccess) {
      response = await fetch(endpoint, fetchOptions)
    }
  }

  return response
}

/**
 * Safely extracts a human-friendly error message from an API error response.
 * Handles FastAPI/Pydantic validation errors (`detail` array of objects),
 * custom HTTPException detail strings, error objects, and fallbacks.
 */
export function extractApiErrorMessage(
  data: unknown,
  fallback: string = "An unexpected error occurred"
): string {
  if (!data) return fallback

  if (typeof data === "string") return data

  if (typeof data === "object") {
    const obj = data as Record<string, unknown>

    if (Array.isArray(obj.detail)) {
      const messages: string[] = []
      for (const item of obj.detail) {
        if (!item || typeof item !== "object") {
          if (typeof item === "string") messages.push(item)
          continue
        }

        const errItem = item as {
          loc?: (string | number)[]
          msg?: string
          message?: string
          type?: string
        }

        // Filter out noise from discriminated union fallbacks if real error exists
        if (
          errItem.type === "literal_error" &&
          errItem.msg?.includes("image")
        ) {
          continue
        }

        let rawMsg = errItem.msg || errItem.message || "Invalid input"
        if (rawMsg.startsWith("Value error, ")) {
          rawMsg = rawMsg.slice("Value error, ".length)
        }

        const loc = errItem.loc
        if (Array.isArray(loc) && loc.length > 0) {
          const cardsIdx = loc.indexOf("cards")
          if (cardsIdx !== -1 && typeof loc[cardsIdx + 1] === "number") {
            const cardNum = (loc[cardsIdx + 1] as number) + 1
            const side = loc.includes("front")
              ? "front"
              : loc.includes("back")
                ? "back"
                : null
            const label = side ? `Card ${cardNum} (${side})` : `Card ${cardNum}`
            messages.push(`${label}: ${rawMsg}`)
            continue
          }

          const meaningfulLoc = loc.filter(
            (p) =>
              p !== "body" &&
              p !== "TextElement" &&
              p !== "ImageElement" &&
              p !== "text" &&
              p !== "image"
          )
          if (meaningfulLoc.length > 0) {
            messages.push(`${meaningfulLoc.join(".")}: ${rawMsg}`)
            continue
          }
        }

        messages.push(rawMsg)
      }

      const uniqueMessages = Array.from(new Set(messages))
      if (uniqueMessages.length > 0) {
        if (uniqueMessages.length <= 3) {
          return uniqueMessages.join(" • ")
        }
        return `${uniqueMessages.slice(0, 3).join(" • ")} (+${uniqueMessages.length - 3} more errors)`
      }
    }

    if (typeof obj.detail === "string") {
      return obj.detail
    }

    if (obj.detail && typeof obj.detail === "object") {
      const detailObj = obj.detail as Record<string, unknown>
      if (typeof detailObj.msg === "string") return detailObj.msg
      if (typeof detailObj.message === "string") return detailObj.message
    }

    if (typeof obj.message === "string") {
      return obj.message
    }

    if (typeof obj.error === "string") {
      return obj.error
    }
  }

  return fallback
}
