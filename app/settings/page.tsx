import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AccountTab } from "./AccountTab"

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="flex flex-wrap h-auto w-full mb-8 justify-start gap-2 bg-transparent">
          <TabsTrigger value="general" className="data-[state=active]:bg-muted">General</TabsTrigger>
          <TabsTrigger value="account" className="data-[state=active]:bg-muted">Account</TabsTrigger>
          <TabsTrigger value="appearance" className="data-[state=active]:bg-muted">Appearance</TabsTrigger>
          <TabsTrigger value="statistics" className="data-[state=active]:bg-muted">Statistics</TabsTrigger>
          <TabsTrigger value="info" className="data-[state=active]:bg-muted">Info</TabsTrigger>
          <TabsTrigger value="donate" className="data-[state=active]:bg-muted">Donate</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="mt-0">
          <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
            <h2 className="text-2xl font-semibold leading-none tracking-tight mb-4">General</h2>
            <p className="text-muted-foreground">General settings will go here.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="account" className="mt-0">
          <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
            <h2 className="text-2xl font-semibold leading-none tracking-tight mb-6">Account Settings</h2>
            <AccountTab />
          </div>
        </TabsContent>
        
        <TabsContent value="appearance" className="mt-0">
          <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
            <h2 className="text-2xl font-semibold leading-none tracking-tight mb-4">Appearance</h2>
            <p className="text-muted-foreground">Appearance settings will go here.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="statistics" className="mt-0">
          <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
            <h2 className="text-2xl font-semibold leading-none tracking-tight mb-4">Statistics</h2>
            <p className="text-muted-foreground">Statistics and data will go here.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="info" className="mt-0">
          <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
            <h2 className="text-2xl font-semibold leading-none tracking-tight mb-4">Info</h2>
            <p className="text-muted-foreground">Information and about page will go here.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="donate" className="mt-0">
          <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
            <h2 className="text-2xl font-semibold leading-none tracking-tight mb-4">Donate</h2>
            <p className="text-muted-foreground">Support the project by donating.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
