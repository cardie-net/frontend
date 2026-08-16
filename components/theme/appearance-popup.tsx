'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useCustomTheme } from './custom-theme-provider';
import { loadAllPreviewFonts, getFontFamilyCss } from '@/lib/theme/font-loader';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface AppearancePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppearancePopup({
  isOpen,
  onClose,
}: AppearancePopupProps) {
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
  } = useCustomTheme();

  const [activeTab, setActiveTab] = useState<'presets' | 'tweak'>('presets');
  const [importError, setImportError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadAllPreviewFonts();
    }
  }, [isOpen]);

  const radiusOptions = [
    { label: '0px', value: 0 },
    { label: '6px', value: 0.375 },
    { label: '10px', value: 0.625 },
    { label: '14px', value: 0.875 },
    { label: '20px', value: 1.25 },
  ];

  const handleExport = () => {
    const json = exportThemeJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cardie-theme.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importThemeJson(content);
      if (!success) {
        setImportError(true);
        setTimeout(() => setImportError(false), 3000);
      }
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md sm:max-w-lg p-6 rounded-3xl backdrop-blur-2xl bg-background/95 border-border/80 text-foreground shadow-2xl">
        {/* Header */}
        <DialogHeader className="flex flex-row items-center gap-3 space-y-0 text-left">
          <div className="p-2 rounded-2xl bg-primary/10 text-primary">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <DialogTitle className="text-base font-semibold">Appearance</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
              Select theme palette, rounding & typography
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-muted/60 rounded-2xl text-xs font-medium mt-1">
          <button
            onClick={() => setActiveTab('presets')}
            className={cn(
              'flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all',
              activeTab === 'presets'
                ? 'bg-background text-foreground shadow-sm font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Themes
          </button>
          <button
            onClick={() => setActiveTab('tweak')}
            className={cn(
              'flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all',
              activeTab === 'tweak'
                ? 'bg-background text-foreground shadow-sm font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Sliders className="w-3.5 h-3.5" />
            Customize
          </button>
        </div>

        {/* Tab Content: Presets (Nameless Color Palette Cards Grid) */}
        {activeTab === 'presets' && (
          <div className="flex flex-col mt-1">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-64 sm:max-h-72 overflow-y-auto overflow-x-hidden p-1.5">
              {presets.map((preset) => {
                const isSelected = activePreset?.id === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset.id)}
                    className={cn(
                      'group relative flex items-center justify-center p-3 rounded-2xl border transition-all duration-200 cursor-pointer select-none',
                      isSelected
                        ? 'border-primary ring-2 ring-primary/40 bg-accent/40 shadow-md'
                        : 'border-border/70 hover:border-muted-foreground/40 hover:bg-accent/20'
                    )}
                  >
                    {/* Visual Theme Color Palette Circles */}
                    <div className="flex items-center justify-center gap-1.5">
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-inner"
                        style={{ backgroundColor: preset.colors.background }}
                      />
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-inner"
                        style={{ backgroundColor: preset.colors.primary }}
                      />
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-inner"
                        style={{ backgroundColor: preset.colors.accent }}
                      />
                    </div>

                    {isSelected && (
                      <div className="absolute -top-1 -right-1 p-0.5 rounded-full bg-primary text-primary-foreground shadow-sm">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab Content: Tweak (Customize) */}
        {activeTab === 'tweak' && (
          <div className="space-y-4 p-1 mt-1">
            {/* Border Radius Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Maximize2 className="w-3.5 h-3.5 text-primary" />
                Rounding (Border Radius)
              </div>
              <div className="grid grid-cols-5 gap-1 bg-muted/40 p-1 rounded-2xl">
                {radiusOptions.map((opt) => {
                  const isSelected = Math.abs(config.radius - opt.value) < 0.05;
                  return (
                    <button
                      key={opt.label}
                      onClick={() => setRadius(opt.value)}
                      className={cn(
                        'py-1.5 text-xs font-medium rounded-xl transition-all',
                        isSelected
                          ? 'bg-primary text-primary-foreground shadow-sm font-semibold'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
                      )}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Typography Pair Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Type className="w-3.5 h-3.5 text-primary" />
                Typography (Font Family)
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {availableFonts.map((font) => {
                  const isSelected = config.fontFamily.toLowerCase() === font.name.toLowerCase();
                  return (
                    <button
                      key={font.id}
                      onClick={() => setFontFamily(font.name)}
                      style={{ fontFamily: getFontFamilyCss(font) }}
                      className={cn(
                        'px-3 py-2 text-xs text-left rounded-xl border transition-all truncate',
                        isSelected
                          ? 'border-primary bg-primary/10 text-foreground font-semibold shadow-sm'
                          : 'border-border/60 text-muted-foreground hover:text-foreground hover:bg-accent/30'
                      )}
                    >
                      {font.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Deck Display Mode Section */}
            <div className="flex items-center justify-between gap-3 pt-1 px-1">
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <Rows className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>Compact deck view</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  Display decks as horizontal lines instead of cards
                </p>
              </div>
              <Switch
                id="compact-deck-mode-toggle"
                checked={deckDisplayMode === 'line'}
                onCheckedChange={(checked) =>
                  setDeckDisplayMode(checked ? 'line' : 'grid')
                }
              />
            </div>
          </div>
        )}

        {/* Footer Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-border/60 mt-3 text-xs">
          <button
            onClick={resetToDefault}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            title="Reset to default theme"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-accent/60 hover:bg-accent text-foreground transition-colors"
              title="Export Theme JSON"
            >
              <Download className="w-3 h-3" />
              Export
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-accent/60 hover:bg-accent text-foreground transition-colors"
              title="Import Theme JSON"
            >
              <Upload className="w-3 h-3" />
              Import
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
          <p className="text-[11px] text-destructive mt-1 text-center">
            Invalid theme JSON file
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
