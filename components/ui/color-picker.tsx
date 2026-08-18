"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { getDeckBgColorClass, DECK_COLORS, DeckColor } from "@/lib/decks"

const BASIC_COLORS: DeckColor[] = [
  "red",
  "orange",
  "green",
  "blue",
  "indigo",
  "purple",
  "pink",
  "rose",
]

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
  className?: string
  disabled?: boolean
}

export function ColorPicker({ color, onChange, className, disabled }: ColorPickerProps) {
  const t = useTranslations("ColorPicker")
  const [customHex, setCustomHex] = React.useState(
    color?.startsWith("#") ? color : "#000000"
  )

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setCustomHex(val)
    if (val.match(/^#[0-9A-Fa-f]{6}$/i)) {
      onChange(val)
    }
  }

  const isHex = color?.startsWith("#")
  const displayColorClass = !isHex ? getDeckBgColorClass(color) : ""

  const getColorLabel = (c?: string | null) => {
    if (!c || c === "default") return t("defaultColor")
    if (c.startsWith("#")) return c
    switch (c) {
      case "red": return t("colors.red")
      case "orange": return t("colors.orange")
      case "amber": return t("colors.amber")
      case "green": return t("colors.green")
      case "emerald": return t("colors.emerald")
      case "teal": return t("colors.teal")
      case "cyan": return t("colors.cyan")
      case "blue": return t("colors.blue")
      case "indigo": return t("colors.indigo")
      case "violet": return t("colors.violet")
      case "purple": return t("colors.purple")
      case "fuchsia": return t("colors.fuchsia")
      case "pink": return t("colors.pink")
      case "rose": return t("colors.rose")
      default: return DECK_COLORS.find((dc) => dc.id === c)?.label || c
    }
  }

  const displayLabel = getColorLabel(color)

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal px-3",
              !color && "text-muted-foreground",
              className
            )}
          >
            <div className="w-full flex items-center gap-2">
              <div 
                className={cn(
                  "h-4 w-4 rounded-full border border-border/50",
                  displayColorClass
                )}
                style={isHex ? { backgroundColor: color } : undefined}
              />
              <span>{displayLabel}</span>
            </div>
          </Button>
        }
      />
      <PopoverContent className="w-[var(--anchor-width)] p-3" align="start">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">{t("basicColors")}</h4>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={disabled}
                className={cn(
                  "h-6 w-6 rounded-full border border-border/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  (!color || color === "default") && "ring-2 ring-primary ring-offset-1",
                  "bg-muted"
                )}
                onClick={() => onChange("default")}
                title={t("defaultColor")}
              />
              {BASIC_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  disabled={disabled}
                  className={cn(
                    "h-6 w-6 rounded-full border border-border/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    color === c && "ring-2 ring-primary ring-offset-1",
                    getDeckBgColorClass(c)
                  )}
                  onClick={() => onChange(c)}
                  title={getColorLabel(c)}
                />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-sm">{t("customColor")}</h4>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={customHex}
                disabled={disabled}
                onChange={(e) => {
                  setCustomHex(e.target.value)
                  onChange(e.target.value)
                }}
                className="h-8 w-12 p-1 cursor-pointer"
              />
              <Input
                type="text"
                value={customHex}
                disabled={disabled}
                onChange={handleHexChange}
                placeholder="#000000"
                className="h-8 flex-1 uppercase"
                maxLength={7}
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
