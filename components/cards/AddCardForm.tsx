"use client"

import { useTranslations } from "next-intl"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Loader2, Maximize } from "lucide-react"

interface AddCardFormProps {
  newFront: string
  setNewFront: (val: string) => void
  newBack: string
  setNewBack: (val: string) => void
  isAddingCard: boolean
  onAddCard: () => void
  onCancel: () => void
  /** Opens the full popup editor for creating a new card. */
  onOpenFullEditor: () => void
}

export function AddCardForm({
  newFront,
  setNewFront,
  newBack,
  setNewBack,
  isAddingCard,
  onAddCard,
  onCancel,
  onOpenFullEditor,
}: AddCardFormProps) {
  const t = useTranslations("Cards")
  const tCommon = useTranslations("Common")

  return (
    <Card className="mb-6 border-dashed">
      <CardContent>
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
              {t("front")}
            </label>
            <Input
              value={newFront}
              onChange={(e) => setNewFront(e.target.value)}
              placeholder={t("questionPlaceholder")}
              disabled={isAddingCard}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
              {t("back")}
            </label>
            <Input
              value={newBack}
              onChange={(e) => setNewBack(e.target.value)}
              placeholder={t("answerPlaceholder")}
              disabled={isAddingCard}
              onKeyDown={(e) => {
                if (e.key === "Enter") onAddCard()
              }}
            />
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            className="w-7 px-0 sm:w-auto sm:px-3"
            onClick={onOpenFullEditor}
            disabled={isAddingCard}
            title={t("fullEditor")}
            aria-label={t("fullEditor")}
          >
            <Maximize className="h-4 w-4 sm:mr-1.5" />
            <span className="hidden sm:inline">{t("fullEditor")}</span>
          </Button>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={isAddingCard}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              size="sm"
              onClick={onAddCard}
              disabled={isAddingCard || !newFront.trim()}
            >
              {isAddingCard ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  {t("adding")}
                </>
              ) : (
                <>
                  <Plus className="mr-1.5 h-4 w-4" />
                  {t("add")}
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
