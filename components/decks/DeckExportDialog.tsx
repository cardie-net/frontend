"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Download, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImportExportConfig } from "@/components/decks/ImportExportConfig";
import {
  DelimiterConfig,
  RecordSeparatorConfig,
  copyTextToClipboard,
  countExportableCards,
  downloadTextFile,
  isSeparatorConfigValid,
  serializeTextExport,
} from "@/lib/importExport";
import { FlashCard } from "@/types";

interface DeckExportDialogProps {
  cards: FlashCard[];
  /** Used for the downloaded file name (e.g. `my-deck.txt`). */
  deckSlug: string;
  onClose: () => void;
}

const FORMATS: ReadonlyArray<{
  id: "text" | "anki";
  label: string;
  comingSoon?: boolean;
}> = [
  { id: "text", label: "Text" },
  { id: "anki", label: "Anki", comingSoon: true },
];

type Format = (typeof FORMATS)[number]["id"];

export function DeckExportDialog({
  cards,
  deckSlug,
  onClose,
}: DeckExportDialogProps) {
  const [format, setFormat] = useState<Format>("text");
  const [delimiter, setDelimiter] = useState<DelimiterConfig>({ kind: "tab" });
  const [recordSeparator, setRecordSeparator] = useState<RecordSeparatorConfig>({
    kind: "newline",
  });
  const [copied, setCopied] = useState(false);

  // Auto-revert the "Copied" state; cleanup clears the timer on unmount.
  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(id);
  }, [copied]);

  const text = useMemo(() => {
    if (format !== "text") return "";
    return serializeTextExport(cards, delimiter, recordSeparator);
  }, [format, cards, delimiter, recordSeparator]);

  const configValid =
    isSeparatorConfigValid(delimiter) && isSeparatorConfigValid(recordSeparator);

  const handleCopy = async () => {
    if (!text) return;
    const ok = await copyTextToClipboard(text);
    if (ok) setCopied(true);
  };

  const handleDownload = () => {
    if (!text) return;
    downloadTextFile(`${deckSlug}.txt`, text);
  };

  return (
    <Dialog
      open
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[min(90vw,42rem)]">
        <DialogHeader>
          <DialogTitle>Export Cards</DialogTitle>
          <DialogDescription>
            Export this deck to text. Anyone who can view the deck can export
            it.
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <ImageOff className="h-4 w-4" />
          <AlertTitle>Images are excluded</AlertTitle>
          <AlertDescription>
            The text export contains only the text of each card side. Images
            are discarded, and cards with no text on the front are omitted.
          </AlertDescription>
        </Alert>
        <Alert>
          <AlertTitle className="text-sm font-medium">One line per card</AlertTitle>
          <AlertDescription>
            Multi-line card text (e.g. markdown with line breaks or code
            blocks) is flattened onto a single line in the export.
          </AlertDescription>
        </Alert>

        <Tabs
          value={format}
          onValueChange={(value) => setFormat(value as Format)}
        >
          <TabsList>
            {FORMATS.map((f) => (
              <TabsTrigger key={f.id} value={f.id} disabled={f.comingSoon}>
                {f.label}
                {f.comingSoon ? " (soon)" : ""}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="text" className="mt-4 space-y-4">
            <ImportExportConfig
              delimiter={delimiter}
              onDelimiterChange={setDelimiter}
              recordSeparator={recordSeparator}
              onRecordSeparatorChange={setRecordSeparator}
            />

            {!configValid && (
              <Alert variant="destructive">
                <AlertTitle>Custom separator needed</AlertTitle>
                <AlertDescription>
                  Enter a non-empty value for the custom delimiter and/or
                  record separator.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid gap-2">
              <Label>Preview</Label>
              <Textarea
                value={text}
                readOnly
                rows={8}
                placeholder="Nothing to export yet."
                className="font-mono text-xs"
              />
              <span className="text-sm text-muted-foreground">
                {text.trim()
                  ? `${countExportableCards(cards)} card(s) in the export`
                  : "0 cards to export"}
              </span>
            </div>
          </TabsContent>

          <TabsContent value="anki" className="mt-4">
            <Alert>
              <AlertDescription>
                Anki export is coming soon. Use the Text format for now.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="outline" onClick={handleCopy} disabled={!text}>
            {copied ? (
              <>
                <Check className="mr-1.5 h-4 w-4" /> Copied
              </>
            ) : (
              <>
                <Copy className="mr-1.5 h-4 w-4" /> Copy
              </>
            )}
          </Button>
          <Button onClick={handleDownload} disabled={!text}>
            <Download className="mr-1.5 h-4 w-4" /> Download .txt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
