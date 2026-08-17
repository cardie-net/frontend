import React from "react"
import Markdown, { type Components } from "react-markdown"
import { cn } from "@/lib/utils"

interface LegalMarkdownProps {
  content: string
  className?: string
  hideH1?: boolean
}

export function LegalMarkdown({
  content,
  className,
  hideH1 = true,
}: LegalMarkdownProps) {
  const components: Components = {
    h1: ({ children }) =>
      hideH1 ? null : (
        <h1 className="mt-8 mb-4 text-2xl font-bold tracking-tight text-foreground first:mt-0 sm:text-3xl">
          {children}
        </h1>
      ),
    h2: ({ children }) => (
      <h2 className="mt-8 mb-3 pb-2 text-lg font-bold tracking-tight text-foreground border-b border-border/60 first:mt-0 sm:text-xl">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-6 mb-2 text-base font-semibold text-foreground first:mt-0 sm:text-lg">
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className="my-3.5 text-sm leading-relaxed text-foreground/90 first:mt-0 last:mb-0 sm:text-base">
        {children}
      </p>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold text-foreground">{children}</strong>
    ),
    em: ({ children }) => (
      <em className="italic text-foreground/90">{children}</em>
    ),
    a: ({ children, href }) => {
      const isExternal = href?.startsWith("http")
      return (
        <a
          href={href}
          className="font-medium text-primary underline underline-offset-4 hover:opacity-80 transition-opacity break-all sm:break-normal"
          {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {children}
        </a>
      )
    },
    ul: ({ children }) => (
      <ul className="my-3.5 space-y-2 list-disc pl-5 sm:pl-6 text-sm leading-relaxed text-foreground/90 sm:text-base">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="my-3.5 space-y-2 list-decimal pl-5 sm:pl-6 text-sm leading-relaxed text-foreground/90 sm:text-base">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="leading-relaxed marker:text-primary/70">{children}</li>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-4 rounded-2xl border-l-4 border-primary/50 bg-primary/5 px-4 py-3 text-sm italic text-muted-foreground">
        {children}
      </blockquote>
    ),
    hr: () => <hr className="my-6 border-border/80" />,
  }

  return (
    <div className={cn("w-full text-foreground", className)}>
      <Markdown components={components}>{content}</Markdown>
    </div>
  )
}
