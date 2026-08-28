"use client"

import { useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import {
  AlertCircle,
  CheckCircle2,
  FileUp,
  Loader2,
  Upload,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ColorPicker } from "@/components/ui/color-picker"
import { ImportExportConfig } from "@/components/decks/ImportExportConfig"
import {
  DelimiterConfig,
  RecordSeparatorConfig,
  isSeparatorConfigValid,
  parseTextImport,
} from "@/lib/importExport"
import { useBatchCreateCards } from "@/hooks/useCards"
import { useImportDeck } from "@/hooks/useDecks"
import { Deck } from "@/types"

type Phase = "idle" | "creating" | "importing" | "done" | "failed"

interface DeckImportDialogProps {
  /** Called when the user closes the dialog (mount is conditional on the caller). */
  onClose: () => void
  /**
   * "append" — import into the existing deck (deck page, owner only).
   * "create" — create a new deck first, then import into it (deck list page).
   */
  mode: "append" | "create"
  /** Required in append mode. */
  deckId?: string
  /** Required in create mode: owner username, used to navigate to the new deck. */
  username?: string
  /** Optional in create mode: create the deck in a specific folder. */
  folderId?: string
}

const FORMATS: ReadonlyArray<{
  id: "text" | "quizlet" | "anki"
  label: string
  comingSoon?: boolean
}> = [
  { id: "text", label: "Text" },
  { id: "quizlet", label: "Quizlet", comingSoon: true },
  { id: "anki", label: "Anki", comingSoon: true },
]

type Format = (typeof FORMATS)[number]["id"]

export function DeckImportDialog({
  onClose,
  mode,
  deckId,
  username,
  folderId,
}: DeckImportDialogProps) {
  const t = useTranslations("ImportExport")
  const tCommon = useTranslations("Common")
  const router = useRouter()
  const batchCreateCards = useBatchCreateCards()
  const importDeck = useImportDeck()

  const [format, setFormat] = useState<Format>("text")
  const [text, setText] = useState("")
  const [delimiter, setDelimiter] = useState<DelimiterConfig>({ kind: "tab" })
  const [recordSeparator, setRecordSeparator] = useState<RecordSeparatorConfig>(
    {
      kind: "newline",
    }
  )
  // Create-mode fields
  const [deckName, setDeckName] = useState("")
  const [deckColor, setDeckColor] = useState("default")
  const [createdDeck, setCreatedDeck] = useState<Deck | null>(null)

  const [phase, setPhase] = useState<Phase>("idle")
  const [result, setResult] = useState<{
    imported: number
    skipped: number
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Max size of a file read through the picker (beyond that, paste instead).
  const MAX_IMPORT_FILE_SIZE = 2 * 1024 * 1024

  const preview = useMemo(() => {
    if (format !== "text" || !text.trim()) return null
    return parseTextImport(text, delimiter, recordSeparator)
  }, [format, text, delimiter, recordSeparator])

  const busy = phase === "creating" || phase === "importing"
  const configValid =
    isSeparatorConfigValid(delimiter) && isSeparatorConfigValid(recordSeparator)
  const canImport =
    !busy &&
    configValid &&
    !!preview &&
    preview.cards.length > 0 &&
    (mode === "append" || !!deckName.trim())

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    if (file.size > MAX_IMPORT_FILE_SIZE) {
      setError(t("fileTooLarge"))
      return
    }
    setError(null)
    const reader = new FileReader()
    reader.onload = () => updateText(String(reader.result ?? ""))
    reader.onerror = () => setError(t("fileReadError"))
    reader.readAsText(file)
  }

  const updateText = (value: string) => {
    setText(value)
  }

  const handleDelimiterChange = (value: DelimiterConfig) => {
    setDelimiter(value)
  }

  const handleRecordSeparatorChange = (value: RecordSeparatorConfig) => {
    setRecordSeparator(value)
  }

  const handleImport = async () => {
    if (!preview || !canImport) return
    setError(null)
    setResult(null)

    const formattedCards = preview.cards.map((card) => ({
      front: [{ type: "text" as const, content: card.front }],
      back: [{ type: "text" as const, content: card.back }],
    }))

    try {
      if (mode === "create") {
        setPhase("creating")
        const deck = await importDeck.mutateAsync({
          name: deckName.trim(),
          color: deckColor,
          folderId,
          cards: formattedCards,
        })
        setCreatedDeck(deck)
        setResult({ imported: preview.cards.length, skipped: preview.skipped })
        setPhase("done")
      } else if (mode === "append" && deckId) {
        setPhase("importing")
        await batchCreateCards.mutateAsync({
          deckId,
          cards: formattedCards,
        })
        setResult({ imported: preview.cards.length, skipped: preview.skipped })
        setPhase("done")
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : tCommon("error")
      setError(`${tCommon("error")}: ${message}`)
      setPhase("failed")
    }
  }

  const handleOpenDeck = () => {
    if (!createdDeck || !username) return
    onClose()
    router.push(`/${username}/${createdDeck.slug || createdDeck.id}`)
  }

  return (
    <Dialog
      open
      onOpenChange={(isOpen) => {
        // Prevent dismissal mid-import: the loop must not keep POSTing to an
        // unmounted dialog, and create mode must not strand a half-built deck.
        if (!isOpen && !busy) onClose()
      }}
    >
      <DialogContent className="sm:max-w-[min(90vw,42rem)]">
        <DialogHeader className="flex flex-row items-center gap-3 space-y-0 text-left">
          <div className="rounded-2xl bg-primary/10 p-2 text-primary">
            <Upload className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="text-base font-semibold">
              {mode === "create" ? t("importNewTitle") : t("importCardsTitle")}
            </DialogTitle>
            <DialogDescription className="mt-0.5 text-xs text-muted-foreground">
              {mode === "create" ? t("importNewDesc") : t("importAppendDesc")}
            </DialogDescription>
          </div>
        </DialogHeader>

        {mode === "append" && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t("appendingAlertTitle")}</AlertTitle>
            <AlertDescription>{t("appendingAlertDesc")}</AlertDescription>
          </Alert>
        )}

        <Tabs
          value={format}
          onValueChange={(value) => {
            // Only the Text tab is enabled; ignore stray changes mid-import.
            if (busy) return
            setFormat(value as Format)
          }}
        >
          <TabsList>
            {FORMATS.map((f) => (
              <TabsTrigger key={f.id} value={f.id} disabled={f.comingSoon}>
                {f.id === "text" ? t("textTab") : f.label}
                {f.comingSoon ? ` ${t("soon")}` : ""}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="text" className="mt-4 space-y-4">
            {mode === "create" && (
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="import-deck-name">{t("deckName")}</Label>
                  <Input
                    id="import-deck-name"
                    value={deckName}
                    onChange={(e) => setDeckName(e.target.value)}
                    placeholder={t("deckNamePlaceholder")}
                    maxLength={80}
                    disabled={busy}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{t("color")}</Label>
                  <ColorPicker
                    color={deckColor}
                    onChange={setDeckColor}
                    disabled={busy}
                  />
                </div>
              </div>
            )}

            <div className="grid gap-2">
              <Label>{t("cardsText")}</Label>
              <Textarea
                value={text}
                onChange={(e) => updateText(e.target.value)}
                placeholder={t("cardsTextPlaceholder")}
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
                  {t("chooseFile")}
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
                        {t.rich("willImport", {
                          count: preview.cards.length,
                          bold: (chunks) => (
                            <strong className="text-foreground">
                              {chunks}
                            </strong>
                          ),
                        })}
                        {preview.skipped > 0 &&
                          t("skipped", { count: preview.skipped })}
                      </>
                    ) : (
                      <span className="text-destructive">
                        {t("noCardsFound")}
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
                <AlertTitle>{t("customSeparatorNeeded")}</AlertTitle>
                <AlertDescription>
                  {t("customSeparatorNeededDesc")}
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertTitle>{tCommon("error")}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {(phase === "importing" || phase === "creating") && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span>
                  {phase === "creating"
                    ? t("creatingProgress", {
                        count: preview?.cards.length ?? 0,
                      })
                    : t("importingProgress", {
                        count: preview?.cards.length ?? 0,
                      })}
                </span>
              </div>
            )}

            {phase === "done" && result && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>{t("importComplete")}</AlertTitle>
                <AlertDescription>
                  {t("importedResult", {
                    count: result.imported,
                    skippedText:
                      result.skipped > 0
                        ? t("skippedResultText", { count: result.skipped })
                        : "",
                  })}
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="quizlet" className="mt-4">
            <Alert>
              <AlertDescription>{t("quizletSoon")}</AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="anki" className="mt-4">
            <Alert>
              <AlertDescription>{t("ankiSoon")}</AlertDescription>
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
            {phase === "done" || phase === "failed"
              ? tCommon("close")
              : tCommon("cancel")}
          </Button>
          {(phase === "done" || phase === "failed") &&
            mode === "create" &&
            createdDeck && (
              <Button onClick={handleOpenDeck}>{t("openDeck")}</Button>
            )}
          {phase !== "done" && (
            <Button onClick={handleImport} disabled={!canImport}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {phase === "creating"
                ? tCommon("creating")
                : phase === "importing"
                  ? tCommon("importing")
                  : phase === "failed"
                    ? t("retryImport")
                    : tCommon("import")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
