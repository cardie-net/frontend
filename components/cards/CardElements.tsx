"use client";

import React, { useState } from 'react';
import { Maximize2 } from 'lucide-react';
import Markdown, { type Components } from 'react-markdown';
import { CardElement, ImageElement, TextElement } from '@/types';
import { cn } from '@/lib/utils';
import { FullscreenImageViewer } from '@/components/shared/FullscreenImageViewer';

const markdownComponents: Components = {
  h1: ({ children }) => <h1 className="mt-4 mb-2 text-2xl font-bold first:mt-0">{children}</h1>,
  h2: ({ children }) => <h2 className="mt-4 mb-2 text-xl font-bold first:mt-0">{children}</h2>,
  h3: ({ children }) => <h3 className="mt-3 mb-2 text-lg font-semibold first:mt-0">{children}</h3>,
  p: ({ children }) => <p className="my-2 first:mt-0 last:mb-0">{children}</p>,
  strong: ({ children }) => <strong className="font-bold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  a: ({ children, href }) => (
    <a
      href={href}
      className="text-primary underline underline-offset-2 hover:opacity-80"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => <ul className="my-2 space-y-1 list-disc pl-6 w-fit mx-auto text-left">{children}</ul>,
  ol: ({ children }) => <ol className="my-2 space-y-1 list-decimal pl-6 w-fit mx-auto text-left">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  code: ({ children }) => (
    <code className="rounded bg-accent px-1 py-0.5 font-mono text-[0.9em]">{children}</code>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-2 border-l-2 border-primary/40 pl-3 italic text-muted-foreground">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-4 border-border" />,
};

const compactMarkdownComponents: Components = {
  h1: ({ children }) => <h1 className="my-0.5 text-sm font-bold leading-tight">{children}</h1>,
  h2: ({ children }) => <h2 className="my-0.5 text-sm font-bold leading-tight">{children}</h2>,
  h3: ({ children }) => <h3 className="my-0.5 text-sm font-semibold leading-tight">{children}</h3>,
  p: ({ children }) => <p className="my-0.5 text-xs leading-relaxed">{children}</p>,
  strong: ({ children }) => <strong className="font-bold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  a: ({ children, href }) => (
    <a
      href={href}
      className="text-xs text-primary underline underline-offset-2 hover:opacity-80"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => <ul className="my-0.5 space-y-0.5 list-disc pl-4 text-left">{children}</ul>,
  ol: ({ children }) => <ol className="my-0.5 space-y-0.5 list-decimal pl-4 text-left">{children}</ol>,
  li: ({ children }) => <li className="text-xs leading-relaxed">{children}</li>,
  code: ({ children }) => (
    <code className="rounded bg-accent px-1 py-0.5 font-mono text-[0.85em]">{children}</code>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-0.5 border-l-2 border-primary/40 pl-2 text-xs italic text-muted-foreground">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-1 border-border" />,
};

/**
 * Renders the element list of a card side: image elements are shown
 * separately (boilerplate styling), text elements are rendered as markdown
 * with fully custom (design-controlled) components.
 *
 * Pass `compact` for small previews (e.g. the card list rows).
 */

function CardImage({ src, compact }: { src: string; compact?: boolean }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFullscreen(true);
  };

  if (compact) {
    return (
      <img
        src={src}
        alt=""
        className="mx-auto max-h-32 w-auto max-w-full rounded-md border bg-muted object-contain"
      />
    );
  }

  return (
    <>
      <div className="group relative mx-auto w-fit max-w-full max-h-[50vh] sm:max-h-[60vh] flex flex-col items-center justify-center overflow-hidden rounded-lg shrink min-h-0">
        <img
          src={src}
          alt=""
          className="max-h-full max-w-full rounded-lg border bg-muted object-contain transition-all duration-300"
          style={{ maxHeight: '100%' }}
        />
        
        {/* Fullscreen button (always visible on mobile, hover on desktop) */}
        <div 
          className="absolute top-2 right-2 flex opacity-100 transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100 z-10"
          onClick={handleOpen}
        >
          <div className="rounded-full bg-background/80 p-2 text-foreground shadow-sm backdrop-blur-md cursor-pointer hover:bg-background/90 hover:scale-105 active:scale-95 transition-all">
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
  );
}

export function CardElements({
  elements,
  className,
  compact = false,
}: {
  elements: CardElement[];
  className?: string;
  compact?: boolean;
}) {
  if (!elements || elements.length === 0) {
    return <div className="text-muted-foreground">Empty</div>;
  }

  const images = elements.filter((el): el is ImageElement => el.type === 'image');
  const texts = elements.filter((el): el is TextElement => el.type === 'text');

  return (
    <div className={cn('flex flex-col w-full flex-1 justify-center items-center gap-6 min-h-0', className)}>
      {images.length > 0 && (
        <div className="flex flex-col items-center justify-center w-full shrink min-h-0">
          {images.map((img, i) => (
            <CardImage key={i} src={img.url} compact={compact} />
          ))}
        </div>
      )}
      
      {texts.length > 0 && (
        <div className="w-full shrink min-h-0 overflow-y-auto px-1">
          {texts.map((text, i) => (
            <div key={i} className={compact ? 'w-full' : 'text-base w-full'}>
              <Markdown components={compact ? compactMarkdownComponents : markdownComponents}>
                {text.content}
              </Markdown>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
