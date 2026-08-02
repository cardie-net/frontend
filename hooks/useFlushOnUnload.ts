import { useEffect } from "react"

/**
 * Invokes `flush()` when the page is hidden or the tab/page is being closed
 * (`pagehide` + `visibilitychange`), and once more on unmount. Used by the
 * session hooks to drain their pending progress-sync queues so no updates are
 * lost when the user navigates away or closes the tab.
 *
 * `flush` should be idempotent and memoized (useCallback) — it may fire
 * several times.
 */
export function useFlushOnUnload(flush: () => void) {
  useEffect(() => {
    const handleUnload = () => {
      flush()
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        handleUnload()
      }
    }

    window.addEventListener("pagehide", handleUnload)
    window.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      window.removeEventListener("pagehide", handleUnload)
      window.removeEventListener("visibilitychange", handleVisibilityChange)
      handleUnload()
    }
  }, [flush])
}
