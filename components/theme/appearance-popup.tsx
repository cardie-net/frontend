"use client"

import React, { useState, useRef, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useCustomTheme } from "./custom-theme-provider"
import { loadAllPreviewFonts, getFontFamilyCss } from "@/lib/theme/font-loader"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Palette,
  Check,
  RotateCcw,
  Sparkles,
  Type,
  Maximize2,
  Sliders,
  Download,
  Upload,
  Rows,
} from "lucide-react"
import { Switch } from "@/components/ui/switch"

interface AppearancePopupProps {
  isOpen: boolean
  onClose: () => void
}

export function AppearancePopup({ isOpen, onClose }: AppearancePopupProps) {
  const t = useTranslations("Appearance")
  const tCommon = useTranslations("Common")
  const {
    config,
    presets,
    availableFonts,
    applyPreset,
    setRadius,
    setFontFamily,
    resetToDefault,
    exportThemeJson,
    importThemeJson,
    activePreset,
    deckDisplayMode,
    setDeckDisplayMode,
  } = useCustomTheme()

  const [activeTab, setActiveTab] = useState<"presets" | "tweak">("presets")
  const [importError, setImportError] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      loadAllPreviewFonts()
    }
  }, [isOpen])

  const radiusOptions = [
    { label: "0px", value: 0 },
    { label: "6px", value: 0.375 },
    { label: "10px", value: 0.625 },
    { label: "14px", value: 0.875 },
    { label: "20px", value: 1.25 },
  ]

  const handleExport = () => {
    const json = exportThemeJson()
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "cardie-theme.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      const success = importThemeJson(content)
      if (!success) {
        setImportError(true)
        setTimeout(() => setImportError(false), 3000)
      }
    }
    reader.readAsText(file)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-3xl border-border/80 bg-background/95 p-6 text-foreground shadow-2xl backdrop-blur-2xl sm:max-w-lg">
        {/* Header */}
        <DialogHeader className="flex flex-row items-center gap-3 space-y-0 text-left">
          <div className="rounded-2xl bg-primary/10 p-2 text-primary">
            <Palette className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="text-base font-semibold">
              {t("title")}
            </DialogTitle>
            <DialogDescription className="mt-0.5 text-xs text-muted-foreground">
              {t("description")}
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Navigation Tabs */}
        <div className="mt-1 grid grid-cols-2 gap-1 rounded-2xl bg-muted/60 p-1 text-xs font-medium">
          <button
            onClick={() => setActiveTab("presets")}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-xl py-2 transition-all",
              activeTab === "presets"
                ? "bg-background font-semibold text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {t("themes")}
          </button>
          <button
            onClick={() => setActiveTab("tweak")}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-xl py-2 transition-all",
              activeTab === "tweak"
                ? "bg-background font-semibold text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Sliders className="h-3.5 w-3.5" />
            {t("customize")}
          </button>
        </div>

        {/* Tab Content: Presets (Nameless Color Palette Cards Grid) */}
        {activeTab === "presets" && (
          <div className="mt-1 flex flex-col">
            <div className="grid max-h-64 grid-cols-3 gap-2.5 overflow-x-hidden overflow-y-auto p-1.5 sm:max-h-72 sm:grid-cols-4">
              {presets.map((preset) => {
                const isSelected = activePreset?.id === preset.id
                return (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset.id)}
                    className={cn(
                      "group relative flex cursor-pointer items-center justify-center rounded-2xl border p-3 transition-all duration-200 select-none",
                      isSelected
                        ? "border-primary bg-accent/40 shadow-md ring-2 ring-primary/40"
                        : "border-border/70 hover:border-muted-foreground/40 hover:bg-accent/20"
                    )}
                  >
                    {/* Visual Theme Color Palette Circles */}
                    <div className="flex items-center justify-center gap-1.5">
                      <div
                        className="h-3.5 w-3.5 rounded-full border border-black/10 shadow-inner"
                        style={{ backgroundColor: preset.colors.background }}
                      />
                      <div
                        className="h-3.5 w-3.5 rounded-full border border-black/10 shadow-inner"
                        style={{ backgroundColor: preset.colors.primary }}
                      />
                      <div
                        className="h-3.5 w-3.5 rounded-full border border-black/10 shadow-inner"
                        style={{ backgroundColor: preset.colors.accent }}
                      />
                    </div>

                    {isSelected && (
                      <div className="absolute -top-1 -right-1 rounded-full bg-primary p-0.5 text-primary-foreground shadow-sm">
                        <Check className="h-2.5 w-2.5" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Tab Content: Tweak (Customize) */}
        {activeTab === "tweak" && (
          <div className="mt-1 space-y-4 p-1">
            {/* Border Radius Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Maximize2 className="h-3.5 w-3.5 text-primary" />
                {t("rounding")}
              </div>
              <div className="grid grid-cols-5 gap-1 rounded-2xl bg-muted/40 p-1">
                {radiusOptions.map((opt) => {
                  const isSelected = Math.abs(config.radius - opt.value) < 0.05
                  return (
                    <button
                      key={opt.label}
                      onClick={() => setRadius(opt.value)}
                      className={cn(
                        "rounded-xl py-1.5 text-xs font-medium transition-all",
                        isSelected
                          ? "bg-primary font-semibold text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                      )}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Typography Pair Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Type className="h-3.5 w-3.5 text-primary" />
                {t("typography")}
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {availableFonts.map((font) => {
                  const isSelected =
                    config.fontFamily.toLowerCase() === font.name.toLowerCase()
                  return (
                    <button
                      key={font.id}
                      onClick={() => setFontFamily(font.name)}
                      style={{ fontFamily: getFontFamilyCss(font) }}
                      className={cn(
                        "truncate rounded-xl border px-3 py-2 text-left text-xs transition-all",
                        isSelected
                          ? "border-primary bg-primary/10 font-semibold text-foreground shadow-sm"
                          : "border-border/60 text-muted-foreground hover:bg-accent/30 hover:text-foreground"
                      )}
                    >
                      {font.name}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Deck Display Mode Section */}
            <div className="flex items-center justify-between gap-3 px-1 pt-1">
              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <Rows className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span>{t("compactDeckView")}</span>
                </div>
                <p className="text-[11px] leading-tight text-muted-foreground">
                  {t("compactDeckViewDesc")}
                </p>
              </div>
              <Switch
                id="compact-deck-mode-toggle"
                checked={deckDisplayMode === "line"}
                onCheckedChange={(checked) =>
                  setDeckDisplayMode(checked ? "line" : "grid")
                }
              />
            </div>
          </div>
        )}

        {/* Footer Controls */}
        <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3 text-xs">
          <button
            onClick={resetToDefault}
            className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
            title={t("reset")}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {t("reset")}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-1 rounded-xl bg-accent/60 px-2.5 py-1.5 text-foreground transition-colors hover:bg-accent"
              title={t("exportTheme")}
            >
              <Download className="h-3 w-3" />
              {tCommon("export")}
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 rounded-xl bg-accent/60 px-2.5 py-1.5 text-foreground transition-colors hover:bg-accent"
              title={t("importTheme")}
            >
              <Upload className="h-3 w-3" />
              {tCommon("import")}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </div>
        </div>

        {importError && (
          <p className="mt-1 text-center text-[11px] text-destructive">
            {t("invalidThemeFile")}
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
