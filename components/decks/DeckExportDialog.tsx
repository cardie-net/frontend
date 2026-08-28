"use client"

import { useEffect, useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Check, Copy, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
import { ImportExportConfig } from "@/components/decks/ImportExportConfig"
import {
  DelimiterConfig,
  RecordSeparatorConfig,
  copyTextToClipboard,
  countExportableCards,
  downloadTextFile,
  isSeparatorConfigValid,
  serializeTextExport,
} from "@/lib/importExport"
import { FlashCard } from "@/types"

interface DeckExportDialogProps {
  cards: FlashCard[]
  /** Used for the downloaded file name (e.g. `my-deck.txt`). */
  deckSlug: string
  onClose: () => void
}

const FORMATS: ReadonlyArray<{
  id: "text" | "anki"
  label: string
  comingSoon?: boolean
}> = [
  { id: "text", label: "Text" },
  { id: "anki", label: "Anki", comingSoon: true },
]

type Format = (typeof FORMATS)[number]["id"]

export function DeckExportDialog({
  cards,
  deckSlug,
  onClose,
}: DeckExportDialogProps) {
  const t = useTranslations("ImportExport")
  const tCommon = useTranslations("Common")
  const [format, setFormat] = useState<Format>("text")
  const [delimiter, setDelimiter] = useState<DelimiterConfig>({ kind: "tab" })
  const [recordSeparator, setRecordSeparator] = useState<RecordSeparatorConfig>(
    {
      kind: "newline",
    }
  )
  const [copied, setCopied] = useState(false)

  // Auto-revert the "Copied" state; cleanup clears the timer on unmount.
  useEffect(() => {
    if (!copied) return
    const id = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(id)
  }, [copied])

  const text = useMemo(() => {
    if (format !== "text") return ""
    return serializeTextExport(cards, delimiter, recordSeparator)
  }, [format, cards, delimiter, recordSeparator])

  const configValid =
    isSeparatorConfigValid(delimiter) && isSeparatorConfigValid(recordSeparator)

  const handleCopy = async () => {
    if (!text) return
    const ok = await copyTextToClipboard(text)
    if (ok) setCopied(true)
  }

  const handleDownload = () => {
    if (!text) return
    downloadTextFile(`${deckSlug}.txt`, text)
  }

  return (
    <Dialog
      open
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
      }}
    >
      <DialogContent className="sm:max-w-[min(90vw,42rem)]">
        <DialogHeader className="flex flex-row items-center gap-3 space-y-0 text-left">
          <div className="rounded-2xl bg-primary/10 p-2 text-primary">
            <Download className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="text-base font-semibold">
              {t("exportTitle")}
            </DialogTitle>
            <DialogDescription className="mt-0.5 text-xs text-muted-foreground">
              {t("exportDesc")}
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* <Alert>
          <ImageOff className="h-4 w-4" />
          <AlertTitle>{t("imagesExcludedTitle")}</AlertTitle>
          <AlertDescription>
            {t("imagesExcludedDesc")}
          </AlertDescription>
        </Alert>
        <Alert>
          <AlertTitle className="text-sm font-medium">{t("oneLineTitle")}</AlertTitle>
          <AlertDescription>
            {t("oneLineDesc")}
          </AlertDescription>
        </Alert> */}

        <Tabs
          value={format}
          onValueChange={(value) => setFormat(value as Format)}
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
            <ImportExportConfig
              delimiter={delimiter}
              onDelimiterChange={setDelimiter}
              recordSeparator={recordSeparator}
              onRecordSeparatorChange={setRecordSeparator}
            />

            {!configValid && (
              <Alert variant="destructive">
                <AlertTitle>{t("customSeparatorNeeded")}</AlertTitle>
                <AlertDescription>
                  {t("customSeparatorNeededDesc")}
                </AlertDescription>
              </Alert>
            )}

            <div className="grid gap-2">
              <Label>{t("preview")}</Label>
              <Textarea
                value={text}
                readOnly
                rows={8}
                placeholder={t("nothingToExport")}
                className="font-mono text-xs"
              />
              <span className="text-sm text-muted-foreground">
                {text.trim()
                  ? t("cardsInExport", { count: countExportableCards(cards) })
                  : t("zeroCardsToExport")}
              </span>
            </div>
          </TabsContent>

          <TabsContent value="anki" className="mt-4">
            <Alert>
              <AlertDescription>{t("ankiExportSoon")}</AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {tCommon("close")}
          </Button>
          <Button variant="outline" onClick={handleCopy} disabled={!text}>
            {copied ? (
              <>
                <Check className="mr-1.5 h-4 w-4" /> {t("copied")}
              </>
            ) : (
              <>
                <Copy className="mr-1.5 h-4 w-4" /> {t("copy")}
              </>
            )}
          </Button>
          <Button onClick={handleDownload} disabled={!text}>
            <Download className="mr-1.5 h-4 w-4" /> {t("downloadTxt")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
