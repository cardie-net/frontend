import { Card, CardContent } from "@/components/ui/card"
import { Settings } from "lucide-react"
import { AccountTab } from "./AccountTab"

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-6 pt-8 pb-6 sm:px-10 sm:pt-24 sm:pb-16 max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
          <Settings className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </div>
      <Card>
        <CardContent>
          <AccountTab />
        </CardContent>
      </Card>
    </div>
  )
}
