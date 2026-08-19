"use client"

import { useTranslations } from "next-intl"
import { LegalLinks } from "@/components/LegalLinks"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Settings, User, GraduationCap } from "lucide-react"
import { AccountTab } from "./AccountTab"
import { LearningTab } from "./LearningTab"
import { useAuth } from "@/lib/AuthContext"
import { Skeleton } from "@/components/ui/skeleton"

export default function SettingsPage() {
  const t = useTranslations("Settings")
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-10 sm:py-16">
        <div className="flex items-center gap-3">
          <Skeleton className="h-11 w-11 rounded-2xl" />
          <Skeleton className="h-9 w-48 rounded-xl" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-3xl" />
        <Skeleton className="h-[400px] w-full rounded-3xl" />
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-10 sm:py-16">
      <div className="flex items-center gap-3">
        <div className="flex shrink-0 items-center justify-center rounded-2xl bg-primary/10 p-2.5 text-primary shadow-sm">
          <Settings className="h-6 w-6" />
        </div>
        <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
          {t("title")}
        </h1>
      </div>

      {!user?.is_guest && (
        <Card className="flex flex-col gap-5 overflow-hidden rounded-3xl border-border/80 bg-card p-5 shadow-sm sm:gap-6 sm:p-6">
          <CardHeader className="p-0">
            <CardTitle className="flex items-center gap-2.5 text-xl font-bold tracking-tight">
              <User className="h-5 w-5 text-primary" />
              {t("accountTitle")}
            </CardTitle>
            <CardDescription className="mt-1 text-xs text-muted-foreground sm:text-sm">
              {t("accountDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="relative p-0">
            <AccountTab />
          </CardContent>
        </Card>
      )}

      <Card id="learning-settings" className="flex flex-col gap-5 overflow-hidden rounded-3xl border-border/80 bg-card p-5 shadow-sm sm:gap-6 sm:p-6">
        <CardHeader className="p-0">
          <CardTitle className="flex items-center gap-2.5 text-xl font-bold tracking-tight">
            <GraduationCap className="h-5 w-5 text-primary" />
            {t("learningTitle")}
          </CardTitle>
          <CardDescription className="mt-1 text-xs text-muted-foreground sm:text-sm">
            {t("learningDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="relative p-0">
          <LearningTab />
        </CardContent>
      </Card>

      <LegalLinks />
    </div>
  )
}
