/**
 * Regression sanity check for lib/importExport.ts — run with:
 *   npm run check:importexport
 * Uses Node's built-in TypeScript type stripping (Node >= 23.6) via the
 * scripts/run-check.mjs loader (handles `@/` alias + extensionless relative
 * imports, which plain Node ESM does not resolve).
 */
import {
  countExportableCards,
  parseTextImport,
  serializeTextExport,
  resolveDelimiter,
  resolveRecordSeparator,
  isCustomSeparatorValid,
} from "../lib/importExport";
import type { FlashCard, CardElement } from "../types";

let failures = 0;

function assert(cond: unknown, label: string): void {
  if (cond) {
    console.log(`  ok: ${label}`);
  } else {
    failures += 1;
    console.error(`FAIL: ${label}`);
  }
}

const textEl = (content: string): CardElement => ({ type: "text", content });
const imgEl = (url: string): CardElement => ({ type: "image", url });

function card(front: string, back: string, imageFront = false): FlashCard {
  return {
    id: Math.random().toString(),
    order: 0,
    deck_id: "d",
    front: imageFront ? [imgEl("x"), textEl(front)] : [textEl(front)],
    back: [textEl(back)],
  };
}

console.log("resolveDelimiter / resolveRecordSeparator");
assert(resolveDelimiter({ kind: "tab" }) === "\t", "tab -> \\t");
assert(resolveDelimiter({ kind: "comma" }) === ",", "comma -> ,");
assert(resolveDelimiter({ kind: "custom", custom: " | " }) === " | ", "custom kept");
assert(resolveRecordSeparator({ kind: "newline" }) === "\n", "newline -> \\n");
assert(resolveRecordSeparator({ kind: "semicolon" }) === ";", "semicolon -> ;");
assert(resolveRecordSeparator({ kind: "custom", custom: "|||" }) === "|||", "custom sep");
assert(!isCustomSeparatorValid(""), "empty custom invalid");
assert(isCustomSeparatorValid(" "), "single space custom valid");
assert(isCustomSeparatorValid("~"), "non-blank custom valid");

console.log("parseTextImport — space as custom delimiter");
{
  const r = parseTextImport(
    "front back\nfront2 back2",
    { kind: "custom", custom: " " },
    { kind: "newline" }
  );
  assert(r.cards.length === 2, "space delimiter splits fields");
  assert(
    r.cards[0].front === "front" && r.cards[0].back === "back",
    "first card split on space"
  );
  assert(
    r.cards[1].front === "front2" && r.cards[1].back === "back2",
    "second card split on space"
  );
}

console.log("parseTextImport — newline + tab");
{
  const r = parseTextImport("front1\tback1\nfront2\tback2", { kind: "tab" }, { kind: "newline" });
  assert(r.cards.length === 2 && r.skipped === 0, "2 cards, 0 skipped");
  assert(r.cards[0].front === "front1" && r.cards[0].back === "back1", "card 1 parsed");
  assert(r.cards[1].front === "front2" && r.cards[1].back === "back2", "card 2 parsed");
}

console.log("parseTextImport — CRLF + empty lines + no-delimiter skip");
{
  const r = parseTextImport(
    "a\tb\r\n\r\nc\td\r\nnodelim\r\n\tdangling",
    { kind: "tab" },
    { kind: "newline" }
  );
  assert(r.cards.length === 2, "2 valid cards");
  assert(r.skipped === 2, "2 skipped (no delim + empty front)");
  assert(r.total === 4, "4 non-empty records");
}

console.log("parseTextImport — comma delimiter with commas inside back");
{
  const r = parseTextImport("Q,answer,with,commas\nQ2,b", { kind: "comma" }, { kind: "newline" });
  assert(r.cards[0].back === "answer,with,commas", "back keeps inner commas");
  assert(r.cards[1].back === "b", "card 2 back");
}

console.log("parseTextImport — semicolon separator, custom delimiter");
{
  const r = parseTextImport("Q1 :: A1; Q2 :: A2", { kind: "custom", custom: " ::" }, { kind: "semicolon" });
  assert(r.cards.length === 2, "2 cards");
  assert(r.cards[0].front === "Q1" && r.cards[0].back === "A1", "first parsed");
  assert(r.cards[1].front === "Q2" && r.cards[1].back === "A2", "second parsed");
}

console.log("parseTextImport — empty separator config");
{
  const r = parseTextImport("a\tb", { kind: "custom", custom: "" }, { kind: "newline" });
  assert(r.cards.length === 0, "empty custom delimiter yields nothing");
}

console.log("serializeTextExport — discards images, skips image-only front");
{
  const cards = [
    card("front one", "back one", true), // has image on front, text still exported
    card("", "image-only front card", true), // no front text -> skipped
    card("plain", ""), // empty back kept
  ];
  const out = serializeTextExport(cards, { kind: "tab" }, { kind: "newline" });
  assert(out === "front one\tback one\nplain\t", "export content correct");
  assert(!out.includes("image-only"), "image-only-front card omitted");
}

console.log("serializeTextExport — collapses multi-line content");
{
  const cards = [
    card("line one\nline two", "back\nwith\n\nseveral lines"),
    card("  spaced   out  ", "already\nfine"),
  ];
  const out = serializeTextExport(cards, { kind: "tab" }, { kind: "newline" });
  assert(
    out === "line one line two\tback with several lines\nspaced out\talready fine",
    "multi-line + extra whitespace collapsed onto single lines"
  );
  assert(!out.includes("\n\n"), "no blank record lines in export");

  // The collapsed export must parse back into the same cards (idempotent format).
  const back = parseTextImport(out, { kind: "tab" }, { kind: "newline" });
  assert(back.cards.length === 2, "collapsed export parses back to same card count");
  assert(
    back.cards[0].front === "line one line two" &&
      back.cards[0].back === "back with several lines",
    "front/back content preserved after collapse round-trip"
  );
  assert(back.cards[1].front === "spaced out", "second card front trimmed+collapsed");
  assert(
    countExportableCards(cards) === back.cards.length,
    "exported row count matches parse back count"
  );
}

console.log("serializeTextExport — whitespace-only sides");
{
  const out = serializeTextExport(
    [card("\n\n", "back"), card("front", "\u00a0\u00a0")],
    { kind: "tab" },
    { kind: "newline" }
  );
  assert(out === "front\t", "whitespace-only front omitted, NBSP back flattened");
}

console.log("parseTextImport — CSV quoting");
{
  const r = parseTextImport(
    '"What, is this?",answer\nhe said "hi","a ""quoted"" back"',
    { kind: "comma" },
    { kind: "newline" }
  );
  assert(r.cards.length === 2, "2 cards");
  assert(
    r.cards[0].front === "What, is this?" && r.cards[0].back === "answer",
    "delimiter inside quoted front"
  );
  assert(r.cards[1].front === 'he said "hi"', "literal quote in unquoted front");
  assert(
    r.cards[1].back === 'a "quoted" back',
    '"" escape inside quoted back'
  );
}

console.log("parseTextImport — multi-line quoted cell");
{
  const r = parseTextImport(
    'a\t"line1\nline2"\nfront\t"b\nc"',
    { kind: "tab" },
    { kind: "newline" }
  );
  assert(r.cards.length === 2, "record separator inside quotes does not split");
  assert(
    r.cards[0].back === "line1\nline2",
    "first multi-line cell preserved"
  );
  assert(r.cards[1].back === "b\nc", "second multi-line cell preserved");
}

console.log("parseTextImport — unterminated quote is lenient");
{
  const r = parseTextImport('a\t"unclosed\nb\tc', { kind: "tab" }, { kind: "newline" });
  assert(r.cards.length === 1, "lenient: one card survives");
  assert(
    r.cards[0].front === "a" && r.cards[0].back === "unclosed\nb\tc",
    "content kept to end of record, no data loss"
  );
}

console.log("serializeTextExport — CSV quoting + round-trip");
{
  const cards = [
    card('front "quoted"', "plain"),
    card("a,b", "c;d"),
    card("x", ""),
  ];
  const out = serializeTextExport(cards, { kind: "comma" }, { kind: "semicolon" });
  assert(
    out === '"front ""quoted""",plain;"a,b","c;d";x,',
    "minimal quoting: only fields containing delim/sep/quote are quoted"
  );
  const back = parseTextImport(out, { kind: "comma" }, { kind: "semicolon" });
  assert(back.cards.length === 3, "quoted export parses back to same count");
  assert(
    back.cards[0].front === 'front "quoted"' && back.cards[0].back === "plain",
    "quoted front round-trips"
  );
  assert(
    back.cards[1].front === "a,b" && back.cards[1].back === "c;d",
    "delimiter+separator inside fields round-trip"
  );
  assert(back.cards[2].back === "", "empty back round-trips");
}

console.log("custom multi-char separators + quoting");
{
  const r = parseTextImport(
    '"a :: b" :: c || d :: e',
    { kind: "custom", custom: " :: " },
    { kind: "custom", custom: " || " }
  );
  assert(r.cards.length === 2, "2 cards with custom separators");
  assert(
    r.cards[0].front === "a :: b" && r.cards[0].back === "c",
    "quoted delimiter inside custom-delimited field"
  );
  assert(r.cards[1].front === "d" && r.cards[1].back === "e", "second card");

  const out = serializeTextExport(
    [card("x || y", "z")],
    { kind: "custom", custom: " :: " },
    { kind: "custom", custom: " || " }
  );
  assert(out === '"x || y" :: z', "custom separator inside field is quoted");
  const back = parseTextImport(
    out,
    { kind: "custom", custom: " :: " },
    { kind: "custom", custom: " || " }
  );
  assert(
    back.cards[0].front === "x || y",
    "custom-separator export round-trips"
  );
}

console.log("parseTextImport — leading-quote legacy semantics");
{
  // CSV semantics: a field starting with a quote is a quoted field, so a
  // leading-quoted field loses its outer quotes.
  const r1 = parseTextImport(
    '"hello" world\tback',
    { kind: "tab" },
    { kind: "newline" }
  );
  assert(
    r1.cards[0].front === "hello world",
    "leading-quoted field loses its outer quotes"
  );
  // A lone leading quote swallows the rest of the record (lenient, no data
  // loss) — the record cannot form a card and is counted as skipped.
  const r2 = parseTextImport(
    '"unclosed\tback',
    { kind: "tab" },
    { kind: "newline" }
  );
  assert(
    r2.cards.length === 0 && r2.skipped === 1,
    "lone leading quote swallows record -> skipped"
  );
}

console.log("parseTextImport — record separator starting with a quote");
{
  const r = parseTextImport(
    'a\tb";"c\td',
    { kind: "tab" },
    { kind: "custom", custom: '";"' }
  );
  assert(r.cards.length === 2 && r.skipped === 0, "quote-leading separator still splits records");
  assert(
    r.cards[0].front === "a" && r.cards[0].back === "b",
    "first record fields"
  );
  assert(
    r.cards[1].front === "c" && r.cards[1].back === "d",
    "second record fields"
  );
}

console.log("countExportableCards");
{
  const cards = [card("a", "b"), card("", "image-only front"), card("c", "")];
  assert(countExportableCards(cards) === 2, "counts only cards with front text");
}

console.log("round-trip — serialize then parse");
{
  const cards = [
    card("Q1", "A1"),
    card("Q2", "A2 with, comma"),
    card("", "dropped on export"),
    card("Q3", ""),
  ];
  const out = serializeTextExport(cards, { kind: "comma" }, { kind: "semicolon" });
  const r = parseTextImport(out, { kind: "comma" }, { kind: "semicolon" });
  assert(r.cards.length === 3, "3 cards survive round-trip");
  assert(r.cards[1].front === "Q2" && r.cards[1].back === "A2 with, comma", "comma in back round-trips");
  assert(r.cards[2].back === "", "empty back round-trips");
}

console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
