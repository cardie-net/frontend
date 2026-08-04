import { Card, CardContent } from "@/components/ui/card"
import { Settings } from "lucide-react"
import { AccountTab } from "./AccountTab"

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8 sm:px-10 sm:py-16 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-sm">
          <Settings className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </div>
      <Card className="rounded-3xl border-border/80 shadow-md bg-card/95 backdrop-blur-2xl overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          <AccountTab />
        </CardContent>
      </Card>
    </div>
  )
}

