"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/AuthContext"
import { apiFetch } from "@/lib/api"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, ListTodo, Shuffle } from "lucide-react"

export function LearningTab() {
  const { user, refreshUser } = useAuth()
  const [multipleChoice, setMultipleChoice] = useState<boolean>(
    user?.preferences?.learning_multiple_choice ?? false
  )
  const [overviewShuffle, setOverviewShuffle] = useState<boolean>(
    user?.preferences?.overview_shuffle ?? false
  )
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    setMultipleChoice(user?.preferences?.learning_multiple_choice ?? false)
    setOverviewShuffle(user?.preferences?.overview_shuffle ?? false)
  }, [user?.preferences])

  const savePreference = useCallback(async (prefs: Record<string, boolean>) => {
    setIsSaving(true)
    setError("")
    setSuccess("")

    try {
      const response = await apiFetch("/api/v1/users/me", {
        method: "PATCH",
        body: JSON.stringify({
          preferences: prefs,
        }),
      })

      if (response.ok) {
        setSuccess("Preference updated.")
        await refreshUser()
        setTimeout(() => setSuccess(""), 3000)
      } else {
        const errData = await response.json().catch(() => ({}))
        setError(
          typeof errData.detail === "string"
            ? errData.detail
            : "Failed to update preference."
        )
      }
    } catch {
      setError("An error occurred while saving preference.")
    } finally {
      setIsSaving(false)
    }
  }, [refreshUser])

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
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500 bg-green-50/50 text-green-900 dark:bg-green-900/20 dark:text-green-300">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
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
              Multiple Choice Answers
            </Label>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Show 4 multiple choice options instead of Knew / Didn&apos;t Know buttons in Learning mode by default.
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
              Shuffle Cards in Overview
            </Label>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Randomize the order of cards in Overview mode by default.
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
