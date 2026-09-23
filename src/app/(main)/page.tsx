"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

import { createClient } from "@/lib/supabase/client"
import { useActiveTeam } from "@/components/layout/team-provider"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CreateTeamForm } from "@/components/teams/create-team-form"
import { ProjectList } from "@/components/projects/project-list"

export default function Home() {
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [email, setEmail] = useState<string | null>(null)

  const { teams, activeTeamId, setActiveTeamId, isLoading: isTeamsLoading, refetchTeams } =
    useActiveTeam()

  useEffect(() => {
    let isMounted = true
    const supabase = createClient()

    supabase.auth.getUser().then(({ data }) => {
      if (isMounted) {
        setEmail(data.user?.email ?? null)
        setIsAuthLoading(false)
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <Skeleton className="h-8 w-64" />
      </div>
    )
  }

  if (!email) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <p className="text-lg text-muted-foreground">Du bist nicht eingeloggt.</p>
          <Button asChild>
            <Link href="/login">Zum Login</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <main className="mx-auto max-w-5xl p-6">
      {isTeamsLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : teams.length === 0 ? (
        <div className="flex justify-center pt-16">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Team erstellen</CardTitle>
              <CardDescription>
                Bevor du Projekte anlegen kannst, brauchst du ein Team.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateTeamForm
                onCreated={(team) => {
                  refetchTeams()
                  setActiveTeamId(team.id)
                }}
              />
            </CardContent>
          </Card>
        </div>
      ) : activeTeamId ? (
        <ProjectList teamId={activeTeamId} />
      ) : null}
    </main>
  )
}
