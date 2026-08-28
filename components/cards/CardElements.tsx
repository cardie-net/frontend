"use client"

import React, { useState } from "react"
import { useTranslations } from "next-intl"
import { Maximize2 } from "lucide-react"
import Markdown, { type Components } from "react-markdown"
import { CardElement, ImageElement, TextElement } from "@/types"
import { cn } from "@/lib/utils"
import { FullscreenImageViewer } from "@/components/shared/FullscreenImageViewer"

const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="mt-4 mb-2 text-2xl font-bold break-words first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-4 mb-2 text-xl font-bold break-words first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-3 mb-2 text-lg font-semibold break-words first:mt-0">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="my-2 break-words first:mt-0 last:mb-0">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-bold break-words">{children}</strong>
  ),
  em: ({ children }) => <em className="break-words italic">{children}</em>,
  a: ({ children, href }) => (
    <a
      href={href}
      className="break-all text-primary underline underline-offset-2 hover:opacity-80"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="mx-auto my-2 w-fit list-disc space-y-1 pl-6 text-left break-words">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mx-auto my-2 w-fit list-decimal space-y-1 pl-6 text-left break-words">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="leading-relaxed break-words">{children}</li>
  ),
  code: ({ children }) => (
    <code className="rounded bg-accent px-1 py-0.5 font-mono text-[0.9em] break-all">
      {children}
    </code>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-2 border-l-2 border-primary/40 pl-3 break-words text-muted-foreground italic">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-4 border-border" />,
}

const compactMarkdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="my-0.5 text-sm leading-tight font-bold break-words">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="my-0.5 text-sm leading-tight font-bold break-words">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="my-0.5 text-sm leading-tight font-semibold break-words">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="my-0.5 text-xs leading-relaxed break-words">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-bold break-words">{children}</strong>
  ),
  em: ({ children }) => <em className="break-words italic">{children}</em>,
  a: ({ children, href }) => (
    <a
      href={href}
      className="text-xs break-all text-primary underline underline-offset-2 hover:opacity-80"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="my-0.5 list-disc space-y-0.5 pl-4 text-left break-words">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-0.5 list-decimal space-y-0.5 pl-4 text-left break-words">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="text-xs leading-relaxed break-words">{children}</li>
  ),
  code: ({ children }) => (
    <code className="rounded bg-accent px-1 py-0.5 font-mono text-[0.85em] break-all">
      {children}
    </code>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-0.5 border-l-2 border-primary/40 pl-2 text-xs break-words text-muted-foreground italic">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-1 border-border" />,
}

/**
 * Renders the element list of a card side: image elements are shown
 * separately (boilerplate styling), text elements are rendered as markdown
 * with fully custom (design-controlled) components.
 *
 * Pass `compact` for small previews (e.g. the card list rows).
 */

function CardImage({ src, compact }: { src: string; compact?: boolean }) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFullscreen(true)
  }

  if (compact) {
    return (
      <img
        src={src}
        alt=""
        className="mx-auto max-h-32 w-auto max-w-full rounded-md border bg-muted object-contain"
      />
    )
  }

  return (
    <>
      <div className="group relative mx-auto flex max-h-[50vh] min-h-0 w-fit max-w-full shrink flex-col items-center justify-center overflow-hidden rounded-lg sm:max-h-[60vh]">
        <img
          src={src}
          alt=""
          className="max-h-full max-w-full rounded-lg border bg-muted object-contain transition-all duration-300"
          style={{ maxHeight: "100%" }}
        />

        {/* Fullscreen button (always visible on mobile, hover on desktop) */}
        <div
          className="absolute top-2 right-2 z-10 flex opacity-100 transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100"
          onClick={handleOpen}
        >
          <div className="cursor-pointer rounded-full bg-background/80 p-2 text-foreground shadow-sm backdrop-blur-md transition-all hover:scale-105 hover:bg-background/90 active:scale-95">
            <Maximize2 className="h-4 w-4 opacity-80" />
          </div>
        </div>
      </div>

      <FullscreenImageViewer
        src={src}
        isOpen={isFullscreen}
        onClose={() => setIsFullscreen(false)}
      />
    </>
  )
}

export function CardElements({
  elements,
  className,
  compact = false,
}: {
  elements: CardElement[]
  className?: string
  compact?: boolean
}) {
  const t = useTranslations("Common")

  if (!elements || elements.length === 0) {
    return <div className="text-muted-foreground">{t("empty")}</div>
  }

  const images = elements.filter(
    (el): el is ImageElement => el.type === "image"
  )
  const texts = elements.filter((el): el is TextElement => el.type === "text")

  return (
    <div
      className={cn(
        "flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-6",
        className
      )}
    >
      {images.length > 0 && (
        <div className="flex min-h-0 w-full shrink flex-col items-center justify-center">
          {images.map((img, i) => (
            <CardImage key={i} src={img.url} compact={compact} />
          ))}
        </div>
      )}

      {texts.length > 0 && (
        <div className="min-h-0 w-full shrink overflow-y-auto px-1">
          {texts.map((text, i) => (
            <div key={i} className={compact ? "w-full" : "w-full text-base"}>
              <Markdown
                components={
                  compact ? compactMarkdownComponents : markdownComponents
                }
              >
                {text.content}
              </Markdown>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
