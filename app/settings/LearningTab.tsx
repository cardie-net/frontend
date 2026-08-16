"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import { useAuth } from "@/lib/AuthContext"
import { apiFetch } from "@/lib/api"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ListTodo, Shuffle } from "lucide-react"

export function LearningTab() {
  const t = useTranslations("Settings.learning")
  const tCommon = useTranslations("Common")
  const { user, refreshUser } = useAuth()
  const [multipleChoice, setMultipleChoice] = useState<boolean>(
    user?.preferences?.learning_multiple_choice ?? false
  )
  const [overviewShuffle, setOverviewShuffle] = useState<boolean>(
    user?.preferences?.overview_shuffle ?? false
  )
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMultipleChoice(user?.preferences?.learning_multiple_choice ?? false)
    setOverviewShuffle(user?.preferences?.overview_shuffle ?? false)
  }, [user?.preferences])

  const savePreference = useCallback(async (prefs: Record<string, boolean>) => {
    setIsSaving(true)
    setError("")

    try {
      const response = await apiFetch("/api/v1/users/me", {
        method: "PATCH",
        body: JSON.stringify({
          preferences: prefs,
        }),
      })

      if (response.ok) {
        await refreshUser()
      } else {
        const errData = await response.json().catch(() => ({}))
        setError(
          typeof errData.detail === "string"
            ? errData.detail
            : t("updateFailed")
        )
      }
    } catch {
      setError(t("saveError"))
    } finally {
      setIsSaving(false)
    }
  }, [refreshUser, t])

  const handleToggleMultipleChoice = (checked: boolean) => {
    setMultipleChoice(checked)
    savePreference({ learning_multiple_choice: checked })
  }

  const handleToggleOverviewShuffle = (checked: boolean) => {
    setOverviewShuffle(checked)
    savePreference({ overview_shuffle: checked })
  }

  return (
    <div className="w-full space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{tCommon("error")}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ListTodo className="h-4 w-4 text-muted-foreground" />
            <Label
              htmlFor="learning-multiple-choice"
              className="text-sm sm:text-base font-medium cursor-pointer"
            >
              {t("multipleChoice")}
            </Label>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {t("multipleChoiceDesc")}
          </p>
        </div>
        <Switch
          id="learning-multiple-choice"
          checked={multipleChoice}
          disabled={isSaving}
          onCheckedChange={handleToggleMultipleChoice}
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Shuffle className="h-4 w-4 text-muted-foreground" />
            <Label
              htmlFor="overview-shuffle"
              className="text-sm sm:text-base font-medium cursor-pointer"
            >
              {t("overviewShuffle")}
            </Label>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {t("overviewShuffleDesc")}
          </p>
        </div>
        <Switch
          id="overview-shuffle"
          checked={overviewShuffle}
          disabled={isSaving}
          onCheckedChange={handleToggleOverviewShuffle}
        />
      </div>
    </div>
  )
}
