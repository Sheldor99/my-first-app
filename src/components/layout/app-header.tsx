"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

import { createClient } from "@/lib/supabase/client"
import { useActiveTeam } from "@/components/layout/team-provider"
import { Button } from "@/components/ui/button"
import { TeamSwitcher } from "@/components/teams/team-switcher"
import { NotificationBell } from "@/components/notifications/notification-bell"

export function AppHeader() {
  const [email, setEmail] = useState<string | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { teams, activeTeamId, setActiveTeamId, isLoading: isTeamsLoading, refetchTeams } =
    useActiveTeam()

  useEffect(() => {
    let isMounted = true
    const supabase = createClient()

    supabase.auth.getUser().then(({ data }) => {
      if (isMounted) setEmail(data.user?.email ?? null)
    })

    return () => {
      isMounted = false
    }
  }, [])

  async function handleLogout() {
    setIsLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  if (!email) return null

  return (
    <header className="flex items-center justify-between border-b p-4">
      <div className="flex items-center gap-3">
        {!isTeamsLoading && teams.length > 0 && (
          <TeamSwitcher
            teams={teams}
            activeTeamId={activeTeamId}
            onSelectTeam={setActiveTeamId}
            onTeamCreated={() => refetchTeams()}
            onTeamsChanged={() => refetchTeams()}
          />
        )}
        {!isTeamsLoading && teams.length > 0 && (
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        )}
      </div>
      <div className="flex items-center gap-4">
        <NotificationBell />
        <span className="text-sm text-muted-foreground">{email}</span>
        <Button onClick={handleLogout} disabled={isLoggingOut} variant="outline" size="sm">
          {isLoggingOut ? "Wird ausgeloggt…" : "Logout"}
        </Button>
      </div>
    </header>
  )
}
