import type { ClientRect, Modifier } from "@dnd-kit/core"
import type { Transform } from "@dnd-kit/utilities"

/**
 * Clamp a drag transform so that a node occupying `rect` never leaves `bounds`.
 *
 * Both rects are in client coordinates: `rect` is the dragged node's rect as
 * measured when the drag started, and `transform` is the translation applied on
 * top of it.
 */
export function clampTransformToBounds(
  transform: Transform,
  rect: ClientRect,
  bounds: ClientRect
): Transform {
  const clamped = { ...transform }

  // dnd-kit measures the dragged node's rect to whole pixels while the browser
  // lays it out on fractional ones, so a plain subtraction can leave the node a
  // sub-pixel past the edge (enough to grow the document's scrollable area).
  // Round inwards for that reason.
  if (rect.left + transform.x <= bounds.left) {
    clamped.x = Math.ceil(bounds.left - rect.left)
  } else if (rect.right + transform.x >= bounds.right) {
    clamped.x = Math.floor(bounds.right - rect.right)
  }

  if (rect.top + transform.y <= bounds.top) {
    clamped.y = Math.ceil(bounds.top - rect.top)
  } else if (rect.bottom + transform.y >= bounds.bottom) {
    clamped.y = Math.floor(bounds.bottom - rect.bottom)
  }

  return clamped
}

/**
 * Viewport rect in client coordinates, excluding scrollbars.
 *
 * dnd-kit's `windowRect` is measured with `innerWidth`/`innerHeight`, which
 * include the scrollbar gutters, so clamping to it still lets a dragged node
 * poke a scrollbar's width past the page and grow the document's scrollable
 * area. Shrinking to the document's client box avoids that.
 */
function getViewportBounds(windowRect: ClientRect): ClientRect {
  if (typeof document === "undefined") return windowRect
  const { clientWidth, clientHeight } = document.documentElement
  const width =
    clientWidth > 0 ? Math.min(clientWidth, windowRect.width) : windowRect.width
  const height =
    clientHeight > 0
      ? Math.min(clientHeight, windowRect.height)
      : windowRect.height

  if (width === windowRect.width && height === windowRect.height) {
    return windowRect
  }

  return { top: 0, left: 0, width, height, right: width, bottom: height }
}

/**
 * Keeps dragged items inside the viewport (dnd-kit's `restrictToWindowEdges`).
 *
 * Without it, dragging a card far enough beyond the page edge grows the
 * document's scrollable area, so the whole site gains a horizontal and/or
 * vertical scrollbar until the drag ends.
 */
export const restrictToViewport: Modifier = ({
  transform,
  draggingNodeRect,
  windowRect,
}) => {
  if (!draggingNodeRect || !windowRect) return transform
  return clampTransformToBounds(
    transform,
    draggingNodeRect,
    getViewportBounds(windowRect)
  )
}
