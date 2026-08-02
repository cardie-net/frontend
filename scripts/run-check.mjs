/**
 * Node loader for the import/export sanity check: maps the `@/` path alias to
 * the project root and probes `.ts`/`.tsx`/`.mts` extensions for extensionless
 * relative imports (plain Node ESM does neither). Run: node scripts/run-check.mjs
 */
import { registerHooks } from "node:module";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      return nextResolve(pathToFileURL(path.join(root, specifier.slice(2))).href, context);
    }
    if (
      (specifier.startsWith("./") || specifier.startsWith("../")) &&
      !path.extname(specifier)
    ) {
      const parent = context.parentURL ? fileURLToPath(context.parentURL) : root;
      const base = path.resolve(path.dirname(parent), specifier);
      for (const ext of [".ts", ".tsx", ".mts"]) {
        if (existsSync(base + ext)) {
          return nextResolve(pathToFileURL(base + ext).href, context);
        }
      }
    }
    return nextResolve(specifier, context);
  },
});

await import("./import-export-check.ts");
