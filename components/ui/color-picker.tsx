"use client"

import * as React from "react"
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
}

export function ColorPicker({ color, onChange, className }: ColorPickerProps) {
  const [customHex, setCustomHex] = React.useState(
    color?.startsWith("#") ? color : "#000000"
  )

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value
    setCustomHex(val)
    if (val.match(/^#[0-9A-Fa-f]{6}$/i)) {
      onChange(val)
    }
  }

  const isHex = color?.startsWith("#")
  const displayColorClass = !isHex ? getDeckBgColorClass(color) : ""
  const displayLabel = isHex ? color : DECK_COLORS.find((c) => c.id === color)?.label || "Default (no color)"

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
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
            <h4 className="font-medium text-sm">Basic Colors</h4>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={cn(
                  "h-6 w-6 rounded-full border border-border/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  (!color || color === "default") && "ring-2 ring-primary ring-offset-1",
                  "bg-muted"
                )}
                onClick={() => onChange("default")}
                title="Default (no color)"
              />
              {BASIC_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={cn(
                    "h-6 w-6 rounded-full border border-border/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    color === c && "ring-2 ring-primary ring-offset-1",
                    getDeckBgColorClass(c)
                  )}
                  onClick={() => onChange(c)}
                  title={DECK_COLORS.find((dc) => dc.id === c)?.label}
                />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Custom Color</h4>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={customHex}
                onChange={(e) => {
                  setCustomHex(e.target.value)
                  onChange(e.target.value)
                }}
                className="h-8 w-12 p-1 cursor-pointer"
              />
              <Input
                type="text"
                value={customHex}
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
