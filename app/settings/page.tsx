import { AccountTab } from "./AccountTab"

export default function SettingsPage() {
  return (
    <div className="container mx-auto p-6 sm:px-10 sm:pt-24 sm:pb-16 max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Settings</h1>
      <AccountTab />
    </div>
  )
}
