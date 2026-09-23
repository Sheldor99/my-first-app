import { AppHeader } from "@/components/layout/app-header"
import { TeamProvider } from "@/components/layout/team-provider"

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <TeamProvider>
      <div className="min-h-screen">
        <AppHeader />
        {children}
      </div>
    </TeamProvider>
  )
}
