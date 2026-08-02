import type { FlashCard } from "@/types";
import { getCardText } from "./cards";

/**
 * Text import/export for decks.
 *
 * The text format is a flat list of records; each record has a front and a
 * back field separated by a delimiter. Both the field delimiter and the
 * record separator are configurable (tab/comma/custom and newline/semicolon/
 * custom respectively) so files round-trip between import and export.
 *
 * Images are NOT part of the text format: export discards them, import only
 * ever produces text elements.
 */

export type DelimiterKind = "tab" | "comma" | "custom";
export type RecordSeparatorKind = "newline" | "semicolon" | "custom";

export interface DelimiterConfig {
  kind: DelimiterKind;
  /** Required (and must be non-empty) when kind === "custom". */
  custom?: string;
}

export interface RecordSeparatorConfig {
  kind: RecordSeparatorKind;
  /** Required (and must be non-empty) when kind === "custom". */
  custom?: string;
}

export interface ParsedCard {
  front: string;
  back: string;
}

export interface TextImportResult {
  cards: ParsedCard[];
  /** Number of records that were dropped (empty or missing a delimiter). */
  skipped: number;
}

export interface ParsedImportPreview extends TextImportResult {
  /** Number of non-empty lines/records found in the input. */
  total: number;
}

/** Resolves a delimiter config to the literal string used for splitting. */
export function resolveDelimiter(config: DelimiterConfig): string {
  if (config.kind === "custom") return config.custom ?? "";
  return config.kind === "tab" ? "\t" : ",";
}

/** Resolves a record-separator config to the literal string used for splitting. */
export function resolveRecordSeparator(config: RecordSeparatorConfig): string {
  if (config.kind === "custom") return config.custom ?? "";
  return config.kind === "newline" ? "\n" : ";";
}

/** A custom separator is usable as long as it is non-empty (a single space is a valid separator). */
export function isCustomSeparatorValid(value: string | undefined): boolean {
  return !!value && value.length > 0;
}

/** True when the given config resolves to a usable (non-empty) separator. */
export function isSeparatorConfigValid(
  config: DelimiterConfig | RecordSeparatorConfig
): boolean {
  if ("kind" in config && config.kind === "custom") {
    return isCustomSeparatorValid(config.custom);
  }
  return true;
}

/**
 * Single-pass quote-aware tokenizer (RFC-4180-ish).
 *
 * Splits `text` into records and fields, honoring quoted fields: a field that
 * starts with a double quote runs until its closing quote, so it may contain
 * the delimiter, the record separator (multi-line cells), and doubled quotes
 * (`""` → `"`). Quotes inside unquoted fields are kept literally. An
 * unterminated quote is treated leniently — everything up to the next record
 * separator is kept as the field's content, so no data is silently dropped.
 *
 * When the delimiter and record separator overlap (one is a prefix of the
 * other), the record separator wins, mirroring the old split-on-sep-first
 * behavior. The record separator also wins over quote handling, so even a
 * separator that itself starts with a double quote keeps working as a record
 * boundary.
 */
function tokenizeText(text: string, delim: string, sep: string): string[][] {
  const records: string[][] = [];
  let fields: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;
  const n = text.length;

  const endField = () => {
    fields.push(field);
    field = "";
  };
  const endRecord = () => {
    endField();
    records.push(fields);
    fields = [];
  };

  while (i < n) {
    if (inQuotes) {
      if (text[i] === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      field += text[i];
      i += 1;
      continue;
    }

    if (text.startsWith(sep, i)) {
      endRecord();
      i += sep.length;
      continue;
    }
    if (field === "" && text[i] === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (text.startsWith(delim, i)) {
      endField();
      i += delim.length;
      continue;
    }
    field += text[i];
    i += 1;
  }

  endRecord();
  return records;
}

/**
 * Splits raw text into front/back card pairs using the configured separators.
 *
 * - CRLF is normalized to LF before splitting when the record separator is
 *   the built-in newline; custom separators match the raw text as-is.
 * - CSV-style double quotes are honored: a quoted field may contain the
 *   delimiter, the record separator, and `""` escaped quotes.
 * - A record is the text between record separators; empty records are skipped.
 * - A record without the delimiter (or with an empty front after trimming)
 *   cannot form a card and is counted in `skipped`.
 * - Any fields beyond the first two are kept as part of the back field
 *   (answers may legitimately contain commas/tabs).
 */
export function parseTextImport(
  text: string,
  delimiter: DelimiterConfig,
  recordSeparator: RecordSeparatorConfig
): ParsedImportPreview {
  const delim = resolveDelimiter(delimiter);
  const sep = resolveRecordSeparator(recordSeparator);
  if (!delim || !sep) {
    return { cards: [], skipped: 0, total: 0 };
  }

  // Only normalize CRLF for the built-in newline separator. A custom separator
  // may legitimately contain \r (e.g. "\r\n") and must match the raw text.
  const normalized =
    sep === "\n" ? text.replace(/\r\n/g, "\n").replace(/\r/g, "\n") : text;
  const records = tokenizeText(normalized, delim, sep);

  const cards: ParsedCard[] = [];
  let skipped = 0;
  let total = 0;

  for (const rawFields of records) {
    // Skip blank records (empty or whitespace-only single field).
    if (rawFields.length <= 1 && !rawFields[0]?.trim()) continue;
    total += 1;

    const front = (rawFields[0] ?? "").trim();
    if (rawFields.length < 2 || !front) {
      skipped += 1;
      continue;
    }

    cards.push({
      front,
      back: rawFields.slice(1).join(delim).trim(),
    });
  }

  return { cards, skipped, total };
}

/**
 * Collapses every run of whitespace — newlines, tabs, multiple spaces, and
 * other unicode whitespace (NBSP, CJK space, line/paragraph separators) — in
 * a card side into a single space and trims the ends, so each exported card
 * is exactly one record line. Note this is deliberately lossy for
 * whitespace-semantic markdown (code blocks, hard line breaks): the text
 * format is one line per card.
 */
function collapseWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

/**
 * CSV-style minimal quoting for one exported field. A field is wrapped in
 * double quotes (with embedded quotes doubled, `""`) only when it contains
 * the delimiter, the record separator, or a quote; plain fields are left
 * unquoted so the output stays readable. Fields escaped this way round-trip
 * exactly through {@link parseTextImport}.
 */
function escapeField(value: string, delim: string, sep: string): string {
  if (!value.includes(delim) && !value.includes(sep) && !value.includes('"')) {
    return value;
  }
  return `"${value.replace(/"/g, '""')}"`;
}

/**
 * Serializes cards to the configured text format.
 *
 * Images are discarded — only the text elements of each side are used, and
 * cards with no text on the front (e.g. image-only fronts) are omitted since
 * they cannot be re-imported. Multi-line (markdown) content in a card side is
 * collapsed onto a single line. Fields containing the delimiter, the record
 * separator, or quotes are CSV-quoted (embedded quotes doubled), so the
 * export round-trips through {@link parseTextImport}.
 */
export function serializeTextExport(
  cards: FlashCard[],
  delimiter: DelimiterConfig,
  recordSeparator: RecordSeparatorConfig
): string {
  const delim = resolveDelimiter(delimiter);
  const sep = resolveRecordSeparator(recordSeparator);
  if (!delim || !sep) return "";

  const rows: string[] = [];
  for (const card of cards) {
    const front = collapseWhitespace(getCardText(card.front));
    const back = collapseWhitespace(getCardText(card.back));
    if (!front) continue;
    rows.push(
      `${escapeField(front, delim, sep)}${delim}${escapeField(back, delim, sep)}`
    );
  }

  return rows.join(sep);
}

/** Number of cards that will appear in a text export (front text non-empty). */
export function countExportableCards(cards: FlashCard[]): number {
  return cards.filter((card) => getCardText(card.front).trim().length > 0)
    .length;
}

/** Downloads a string as a UTF-8 text file. Client-side only. */
export function downloadTextFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/** Copies text to the clipboard, falling back to execCommand in non-secure contexts. */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      return true;
    } catch {
      return false;
    }
  }
}
