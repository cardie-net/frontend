"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, FileUp, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImportExportConfig } from "@/components/decks/ImportExportConfig";
import { DECK_COLORS } from "@/lib/decks";
import {
  DelimiterConfig,
  RecordSeparatorConfig,
  isSeparatorConfigValid,
  parseTextImport,
} from "@/lib/importExport";
import { useCreateCard } from "@/hooks/useCards";
import { useCreateDeck } from "@/hooks/useDecks";
import { Deck } from "@/types";

type Phase = "idle" | "creating" | "importing" | "done" | "failed";

interface DeckImportDialogProps {
  /** Called when the user closes the dialog (mount is conditional on the caller). */
  onClose: () => void;
  /**
   * "append" — import into the existing deck (deck page, owner only).
   * "create" — create a new deck first, then import into it (deck list page).
   */
  mode: "append" | "create";
  /** Required in append mode. */
  deckId?: string;
  /** Required in create mode: owner username, used to navigate to the new deck. */
  username?: string;
  /** Optional in create mode: create the deck in a specific folder. */
  folderId?: string;
}

const FORMATS: ReadonlyArray<{
  id: "text" | "quizlet" | "anki";
  label: string;
  comingSoon?: boolean;
}> = [
  { id: "text", label: "Text" },
  { id: "quizlet", label: "Quizlet", comingSoon: true },
  { id: "anki", label: "Anki", comingSoon: true },
]

type Format = (typeof FORMATS)[number]["id"];

export function DeckImportDialog({
  onClose,
  mode,
  deckId,
  username,
  folderId,
}: DeckImportDialogProps) {
  const router = useRouter();
  const createCard = useCreateCard();
  const createDeck = useCreateDeck();

  const [format, setFormat] = useState<Format>("text");
  const [text, setText] = useState("");
  const [delimiter, setDelimiter] = useState<DelimiterConfig>({ kind: "tab" });
  const [recordSeparator, setRecordSeparator] = useState<RecordSeparatorConfig>({
    kind: "newline",
  });
  // Create-mode fields
  const [deckName, setDeckName] = useState("");
  const [deckColor, setDeckColor] = useState("default");
  const [createdDeck, setCreatedDeck] = useState<Deck | null>(null);

  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  /** Index of the first card not yet imported (used to retry after a partial failure). */
  const [failIndex, setFailIndex] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Max size of a file read through the picker (beyond that, paste instead).
  const MAX_IMPORT_FILE_SIZE = 2 * 1024 * 1024;

  // The dialog is mounted fresh each time it is opened (callers render it
  // conditionally), so all state initializers below are the "empty" defaults.

  const preview = useMemo(() => {
    if (format !== "text" || !text.trim()) return null;
    return parseTextImport(text, delimiter, recordSeparator);
  }, [format, text, delimiter, recordSeparator]);

  const busy = phase === "creating" || phase === "importing";
  const configValid =
    isSeparatorConfigValid(delimiter) && isSeparatorConfigValid(recordSeparator);
  const remainingCount = preview ? preview.cards.length - failIndex : 0;
  const canImport =
    !busy &&
    configValid &&
    !!preview &&
    remainingCount > 0 &&
    (mode === "append" || !!createdDeck || !!deckName.trim());

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_IMPORT_FILE_SIZE) {
      setError(
        "File is too large (max 2 MB). Please paste the content into the text field instead."
      );
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => updateText(String(reader.result ?? ""));
    reader.onerror = () => setError("Could not read the selected file.");
    reader.readAsText(file);
  };

  /** Updates the source text and invalidates any partial-failure retry offset. */
  const updateText = (value: string) => {
    setText(value);
    setFailIndex(0);
  };

  // Changing the parser config re-parses the text into different cards, so a
  // partial-failure retry offset no longer applies.
  const handleDelimiterChange = (value: DelimiterConfig) => {
    setDelimiter(value);
    setFailIndex(0);
  };

  const handleRecordSeparatorChange = (value: RecordSeparatorConfig) => {
    setRecordSeparator(value);
    setFailIndex(0);
  };

  const handleImport = async () => {
    if (!preview || !canImport) return;
    setError(null);
    setResult(null);

    // Resume from where a previous attempt stopped (partial-failure retry),
    // and reuse the deck already created by a failed create-mode attempt.
    const startIndex = failIndex;
    const remaining = preview.cards.slice(startIndex);
    let targetDeckId = deckId ?? createdDeck?.id;
    let imported = startIndex;
    try {
      if (mode === "create" && !targetDeckId) {
        setPhase("creating");
        const deck = await createDeck.mutateAsync({
          name: deckName.trim(),
          color: deckColor,
          folderId,
        });
        setCreatedDeck(deck);
        targetDeckId = deck.id;
      }

      setPhase("importing");
      setProgress({ done: startIndex, total: preview.cards.length });
      for (const card of remaining) {
        await createCard.mutateAsync({
          deckId: targetDeckId!,
          front: [{ type: "text", content: card.front }],
          back: [{ type: "text", content: card.back }],
        });
        imported += 1;
        setProgress({ done: imported, total: preview.cards.length });
      }

      setFailIndex(0);
      setResult({ imported, skipped: preview.skipped });
      setPhase("done");
    } catch (err) {
      setFailIndex(imported);
      const message = err instanceof Error ? err.message : "Import failed";
      setError(
        `Import failed: ${message}${
          imported > startIndex
            ? ` — ${imported - startIndex} card(s) were imported before the failure.`
            : ""
        }`
      );
      setPhase("failed");
    }
  };

  const handleOpenDeck = () => {
    if (!createdDeck || !username) return;
    onClose();
    router.push(`/${username}/${createdDeck.slug || createdDeck.id}`);
  };

  return (
    <Dialog
      open
      onOpenChange={(isOpen) => {
        // Prevent dismissal mid-import: the loop must not keep POSTing to an
        // unmounted dialog, and create mode must not strand a half-built deck.
        if (!isOpen && !busy) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[min(90vw,42rem)]">
        <DialogHeader className="flex flex-row items-center gap-3 space-y-0 text-left">
            <div className="p-2 rounded-2xl bg-primary/10 text-primary">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">{mode === "create" ? "Import to New Deck" : "Import Cards"}</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Import flashcards from text. {mode === "create"
              ? "A new deck will be created with the cards."
              : "Cards will be appended to this deck."}
              </DialogDescription>
            </div>
          </DialogHeader>

        {mode === "append" && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Appending cards</AlertTitle>
            <AlertDescription>
              The imported cards will be added to the end of this deck. No
              existing cards will be modified.
            </AlertDescription>
          </Alert>
        )}

        <Tabs
          value={format}
          onValueChange={(value) => {
            // Only the Text tab is enabled; ignore stray changes mid-import.
            if (busy) return;
            setFormat(value as Format);
          }}
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
            {mode === "create" && (
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="import-deck-name">Deck Name</Label>
                  <Input
                    id="import-deck-name"
                    value={deckName}
                    onChange={(e) => setDeckName(e.target.value)}
                    placeholder="e.g. Spanish Vocabulary"
                    maxLength={80}
                    disabled={busy}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Color</Label>
                  <Select
                    value={deckColor}
                    onValueChange={(value) => {
                      if (value) setDeckColor(value);
                    }}
                    disabled={busy}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DECK_COLORS.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="grid gap-2">
              <Label>Cards text</Label>
              <Textarea
                value={text}
                onChange={(e) => updateText(e.target.value)}
                placeholder={"One card per line, front and back separated by the delimiter, e.g.\nfront\tback"}
                rows={8}
                disabled={busy}
              />
              <div className="flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={busy}
                >
                  <FileUp className="mr-1.5 h-4 w-4" />
                  Choose file…
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.csv,.tsv,text/plain"
                  className="hidden"
                  onChange={handleFileSelected}
                />
                {preview && (
                  <span className="text-sm text-muted-foreground">
                    {preview.cards.length > 0 ? (
                      <>
                        Will import{" "}
                        <strong className="text-foreground">
                          {preview.cards.length}
                        </strong>{" "}
                        card{preview.cards.length === 1 ? "" : "s"}
                        {preview.skipped > 0 &&
                          ` · ${preview.skipped} record${preview.skipped === 1 ? "" : "s"} skipped`}
                      </>
                    ) : (
                      <span className="text-destructive">
                        No importable cards found
                      </span>
                    )}
                  </span>
                )}
              </div>
            </div>

            <ImportExportConfig
              delimiter={delimiter}
              onDelimiterChange={handleDelimiterChange}
              recordSeparator={recordSeparator}
              onRecordSeparatorChange={handleRecordSeparatorChange}
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

            {error && (
              <Alert variant="destructive">
                <AlertTitle>Import failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {(phase === "importing" || phase === "creating") && (
              <div className="grid gap-2">
                <Progress
                  value={
                    progress.total > 0
                      ? Math.round((progress.done / progress.total) * 100)
                      : 0
                  }
                />
                <span className="text-sm text-muted-foreground">
                  {phase === "creating"
                    ? "Creating deck…"
                    : `Importing cards… ${progress.done}/${progress.total}`}
                </span>
              </div>
            )}

            {phase === "done" && result && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Import complete</AlertTitle>
                <AlertDescription>
                  Imported {result.imported} card
                  {result.imported === 1 ? "" : "s"}
                  {result.skipped > 0 &&
                    `, skipped ${result.skipped} record${result.skipped === 1 ? "" : "s"}`}
                  .
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="quizlet" className="mt-4">
            <Alert>
              <AlertDescription>
                Quizlet import is coming soon. Use the Text format for now.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="anki" className="mt-4">
            <Alert>
              <AlertDescription>
                Anki import is coming soon. Use the Text format for now.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onClose()}
            disabled={busy}
          >
            {phase === "failed" ? "Close" : "Cancel"}
          </Button>
          {(phase === "done" || phase === "failed") &&
            mode === "create" &&
            createdDeck && (
              <Button onClick={handleOpenDeck}>Open Deck</Button>
            )}
          {phase !== "done" && (
            <Button onClick={handleImport} disabled={!canImport}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {phase === "creating"
                ? "Creating…"
                : phase === "importing"
                  ? "Importing…"
                  : phase === "failed" && remainingCount > 0
                    ? `Retry remaining (${remainingCount})`
                    : "Import"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
