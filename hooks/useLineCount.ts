"use client"

import { useLayoutEffect, useState, type RefObject } from "react"

/**
 * Reports how many text lines an element currently renders.
 *
 * Works for `line-clamp-*`ed elements (whose height is always a whole number of
 * lines) and is kept in sync on resize, so callers can drop neighbouring
 * content when a title starts wrapping.
 */
export function useLineCount(ref: RefObject<HTMLElement | null>): number {
  const [lines, setLines] = useState(1)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    const measure = () => {
      const { lineHeight } = getComputedStyle(el)
      const parsed = Number.parseFloat(lineHeight)
      const next =
        Number.isFinite(parsed) && parsed > 0
          ? Math.max(1, Math.round(el.clientHeight / parsed))
          : 1
      setLines((prev) => (prev === next ? prev : next))
    }

    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref])

  return lines
}
