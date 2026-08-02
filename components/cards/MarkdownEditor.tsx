'use client';

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import {
  Bold,
  Eye,
  Heading1,
  Heading2,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Loader2,
  PenLine,
  Trash2,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CardElements } from '@/components/cards/CardElements';
import { buildElements, uploadCardImage } from '@/lib/cards';
import { cn } from '@/lib/utils';

interface MarkdownEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Deck the image uploads belong to. */
  deckId: string;
  /** Current image URL for this side, if one is set (max one per side). */
  imageUrl: string | null;
  onImageUrlChange: (url: string | null) => void;
  placeholder?: string;
  className?: string;
}

function ToolButton({
  onClick,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  title: string;
  children: ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className="h-7 w-7"
    >
      {children}
    </Button>
  );
}

/**
 * Native markdown editor: a plain textarea with a custom toolbar that
 * inserts/wraps markdown at the cursor. 100% design control — no editor lib.
 * The image is managed outside the text (one per side) and shown separately.
 */
export function MarkdownEditor({
  label,
  value,
  onChange,
  deckId,
  imageUrl,
  onImageUrlChange,
  placeholder,
  className,
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<'write' | 'preview'>('write');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // Restores the caret/selection right after a toolbar insert re-renders.
  const pendingSelection = useRef<[number, number] | null>(null);

  useLayoutEffect(() => {
    if (pendingSelection.current && taRef.current) {
      const [start, end] = pendingSelection.current;
      taRef.current.setSelectionRange(start, end);
      pendingSelection.current = null;
    }
  }, [value]);

  const applyWrap = useCallback(
    (before: string, after: string) => {
      const ta = taRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const selected = value.slice(start, end);
      onChange(value.slice(0, start) + before + selected + after + value.slice(end));
      pendingSelection.current = selected
        ? [start + before.length, start + before.length + selected.length]
        : [start + before.length, start + before.length];
    },
    [value, onChange]
  );

  const insertLink = useCallback(() => {
    const url = window.prompt('Link URL');
    if (!url) return;
    const ta = taRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.slice(start, end);
    if (selected) {
      onChange(value.slice(0, start) + `[${selected}](${url})` + value.slice(end));
      pendingSelection.current = [start + 1, start + 1 + selected.length];
    } else {
      const label = 'text';
      onChange(value.slice(0, start) + `[${label}](${url})` + value.slice(end));
      pendingSelection.current = [start + 1, start + 1 + label.length];
    }
  }, [value, onChange]);

  const toggleLinePrefix = useCallback(
    (marker: string) => {
      const ta = taRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const selected = value.slice(start, end);
      const multiline = selected.includes('\n');

      if (!multiline) {
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const lineEndIdx = value.indexOf('\n', start);
        const lineEnd = lineEndIdx === -1 ? value.length : lineEndIdx;
        const line = value.slice(lineStart, lineEnd);
        const has = line.startsWith(marker);
        const newLine = has ? line.slice(marker.length) : marker + line;
        onChange(value.slice(0, lineStart) + newLine + value.slice(lineEnd));
        const delta = has ? -marker.length : marker.length;
        pendingSelection.current = [start + delta, end + delta];
      } else {
        const newLines = selected
          .split('\n')
          .map((l) => (l.startsWith(marker) ? l.slice(marker.length) : marker + l));
        onChange(value.slice(0, start) + newLines.join('\n') + value.slice(end));
      }
    },
    [value, onChange]
  );

  const toggleHeading = useCallback(
    (level: 1 | 2) => {
      const marker = level === 1 ? '# ' : '## ';
      const ta = taRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const lineEndIdx = value.indexOf('\n', start);
      const lineEnd = lineEndIdx === -1 ? value.length : lineEndIdx;
      const line = value.slice(lineStart, lineEnd);
      const has = line.startsWith(marker);
      if (has) {
        onChange(value.slice(0, lineStart) + line.slice(marker.length) + value.slice(lineEnd));
        pendingSelection.current = [start - marker.length, start - marker.length];
      } else {
        const oldMarker = line.match(/^#{1,6} /)?.[0] ?? '';
        onChange(value.slice(0, lineStart) + marker + line.slice(oldMarker.length) + value.slice(lineEnd));
        const delta = marker.length - oldMarker.length;
        pendingSelection.current = [start + delta, start + delta];
      }
    },
    [value, onChange]
  );

  const handleImageUrl = useCallback(() => {
    const url = window.prompt('Image URL');
    if (url) onImageUrlChange(url.trim());
  }, [onImageUrlChange]);

  const uploadFile = useCallback(
    async (file: File) => {
      if (imageUrl) {
        setUploadError('One image per side — remove the current image first');
        return;
      }
      setUploading(true);
      setUploadError(null);
      try {
        const url = await uploadCardImage(deckId, file);
        onImageUrlChange(url);
      } catch (e) {
        setUploadError(e instanceof Error ? e.message : 'Failed to upload image');
      } finally {
        setUploading(false);
      }
    },
    [deckId, imageUrl, onImageUrlChange]
  );

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) uploadFile(file);
      // Allow re-selecting the same file later (e.g. after removing the image).
      e.target.value = '';
    },
    [uploadFile]
  );

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLTextAreaElement>) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) uploadFile(file);
          return;
        }
      }
    },
    [uploadFile]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (!(e.metaKey || e.ctrlKey) || e.shiftKey || e.altKey) return;
      const key = e.key.toLowerCase();
      if (key === 'b') {
        e.preventDefault();
        applyWrap('**', '**');
      } else if (key === 'i') {
        e.preventDefault();
        applyWrap('*', '*');
      } else if (key === 'k') {
        e.preventDefault();
        insertLink();
      }
    },
    [applyWrap, insertLink]
  );

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Tabs value={mode} onValueChange={(v) => setMode(v as 'write' | 'preview')} className="gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          <TabsList className="h-7">
            <TabsTrigger value="write">
              <PenLine />
              Write
            </TabsTrigger>
            <TabsTrigger value="preview">
              <Eye />
              Preview
            </TabsTrigger>
          </TabsList>
        </div>

        {mode === 'write' && (
          <div className="flex flex-wrap items-center gap-0.5 rounded-xl border bg-muted/40 p-1">
            <ToolButton onClick={() => applyWrap('**', '**')} title="Bold (Ctrl/Cmd+B)">
              <Bold />
            </ToolButton>
            <ToolButton onClick={() => applyWrap('*', '*')} title="Italic (Ctrl/Cmd+I)">
              <Italic />
            </ToolButton>
            <span className="mx-0.5 h-5 w-px bg-border" />
            <ToolButton onClick={() => toggleHeading(1)} title="Heading 1">
              <Heading1 />
            </ToolButton>
            <ToolButton onClick={() => toggleHeading(2)} title="Heading 2">
              <Heading2 />
            </ToolButton>
            <span className="mx-0.5 h-5 w-px bg-border" />
            <ToolButton onClick={insertLink} title="Link (Ctrl/Cmd+K)">
              <LinkIcon />
            </ToolButton>
            <ToolButton onClick={() => toggleLinePrefix('- ')} title="Bullet list">
              <List />
            </ToolButton>
            <ToolButton onClick={() => toggleLinePrefix('1. ')} title="Numbered list">
              <ListOrdered />
            </ToolButton>
            <span className="mx-0.5 h-5 w-px bg-border" />
            <DropdownMenu>
              <DropdownMenuTrigger
                disabled={imageUrl !== null || uploading}
                title={
                  imageUrl
                    ? 'One image per side — remove the current image first'
                    : 'Add image'
                }
                render={<Button variant="ghost" size="icon-sm" className="h-7 w-7" />}
              >
                {uploading ? <Loader2 className="animate-spin" /> : <ImageIcon />}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                  <Upload />
                  Upload image…
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleImageUrl}>
                  <LinkIcon />
                  From URL…
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        <TabsContent value="write">
          <Textarea
            ref={taRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={placeholder}
            className="min-h-[240px] w-full resize-y md:text-base"
          />
        </TabsContent>
        <TabsContent value="preview">
          <div className="min-h-[240px] w-full overflow-auto rounded-xl border bg-card p-4">
            <CardElements elements={buildElements(value, imageUrl)} />
          </div>
        </TabsContent>
      </Tabs>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {uploadError && <p className="text-xs text-destructive">{uploadError}</p>}

      {imageUrl && (
        <div className="flex items-center gap-3 rounded-xl border bg-muted/40 p-2">
          <img src={imageUrl} alt="" className="h-14 w-14 rounded-md border object-cover" />
          <span className="flex-1 truncate text-xs text-muted-foreground">{imageUrl}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onImageUrlChange(null)}
            title="Remove image"
            aria-label="Remove image"
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 />
          </Button>
        </div>
      )}
    </div>
  );
}
