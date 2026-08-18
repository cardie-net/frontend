"use client";

import { useTranslations } from "next-intl";
import {
  DelimiterConfig,
  RecordSeparatorConfig,
} from "@/lib/importExport";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ImportExportConfigProps {
  delimiter: DelimiterConfig;
  onDelimiterChange: (delimiter: DelimiterConfig) => void;
  recordSeparator: RecordSeparatorConfig;
  onRecordSeparatorChange: (recordSeparator: RecordSeparatorConfig) => void;
}

/**
 * Shared delimiter / record-separator controls used by both the import and
 * export dialogs so the two always expose the same options.
 */
export function ImportExportConfig({
  delimiter,
  onDelimiterChange,
  recordSeparator,
  onRecordSeparatorChange,
}: ImportExportConfigProps) {
  const t = useTranslations("ImportExport");

  return (
    <div className="grid gap-4 sm:grid-cols-2 items-start">
      <div className="grid gap-2">
        <Label>{t("fieldDelimiter")}</Label>
        <Select
          value={delimiter.kind}
          onValueChange={(kind) =>
            onDelimiterChange({
              kind: kind as DelimiterConfig["kind"],
              custom: delimiter.custom,
            })
          }
          items={{
            tab: t("tab"),
            comma: t("comma"),
            custom: t("custom"),
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tab">{t("tab")}</SelectItem>
            <SelectItem value="comma">{t("comma")}</SelectItem>
            <SelectItem value="custom">{t("custom")}</SelectItem>
          </SelectContent>
        </Select>
        {delimiter.kind === "custom" && (
          <Input
            value={delimiter.custom ?? ""}
            onChange={(e) =>
              onDelimiterChange({ kind: "custom", custom: e.target.value })
            }
            placeholder="e.g. |"
            maxLength={20}
          />
        )}
      </div>

      <div className="grid gap-2">
        <Label>{t("separateCardsWith")}</Label>
        <Select
          value={recordSeparator.kind}
          onValueChange={(kind) =>
            onRecordSeparatorChange({
              kind: kind as RecordSeparatorConfig["kind"],
              custom: recordSeparator.custom,
            })
          }
          items={{
            newline: t("newLine"),
            semicolon: t("semicolon"),
            custom: t("custom"),
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newline">{t("newLine")}</SelectItem>
            <SelectItem value="semicolon">{t("semicolon")}</SelectItem>
            <SelectItem value="custom">{t("custom")}</SelectItem>
          </SelectContent>
        </Select>
        {recordSeparator.kind === "custom" && (
          <Input
            value={recordSeparator.custom ?? ""}
            onChange={(e) =>
              onRecordSeparatorChange({
                kind: "custom",
                custom: e.target.value,
              })
            }
            placeholder="e.g. ||"
            maxLength={20}
          />
        )}
      </div>
    </div>
  );
}
