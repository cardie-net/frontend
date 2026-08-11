import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Settings, User } from "lucide-react"
import { AccountTab } from "./AccountTab"

export default function SettingsPage() {
  return (
    <div className="container mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-10 sm:py-16">
      <div className="flex items-center gap-3">
        <div className="flex shrink-0 items-center justify-center rounded-2xl bg-primary/10 p-2.5 text-primary shadow-sm">
          <Settings className="h-6 w-6" />
        </div>
        <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
          Settings
        </h1>
      </div>

      <Card className="flex flex-col gap-5 overflow-hidden rounded-3xl border-border/80 bg-card p-5 shadow-sm sm:gap-6 sm:p-6">
        <CardHeader className="p-0">
          <CardTitle className="flex items-center gap-2.5 text-xl font-bold tracking-tight">
            <User className="h-5 w-5 text-primary" />
            Account Settings
          </CardTitle>
          <CardDescription className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Manage your profile settings and public information
          </CardDescription>
        </CardHeader>
        <CardContent className="relative p-0">
          <AccountTab />
        </CardContent>
      </Card>
    </div>
  )
}
