"use client"

import { useCallback, useEffect, useState } from "react"

import { createClient } from "@/lib/supabase/client"

export interface Team {
  id: string
  name: string
  created_by: string | null
  created_at: string
}

const ACTIVE_TEAM_STORAGE_KEY = "activeTeamId"

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([])
  const [activeTeamId, setActiveTeamIdState] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchTeams = useCallback(async () => {
    setIsLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("teams")
      .select("id, name, created_by, created_at")
      .order("created_at", { ascending: true })

    if (!error && data) {
      setTeams(data)

      setActiveTeamIdState((current) => {
        const storedId =
          current ?? window.localStorage.getItem(ACTIVE_TEAM_STORAGE_KEY)
        const storedIsValid = data.some((team) => team.id === storedId)
        return storedIsValid ? storedId : (data[0]?.id ?? null)
      })
    }

    setIsLoading(false)
  }, [])

  useEffect(() => {
    fetchTeams()
  }, [fetchTeams])

  const setActiveTeamId = useCallback((teamId: string) => {
    setActiveTeamIdState(teamId)
    window.localStorage.setItem(ACTIVE_TEAM_STORAGE_KEY, teamId)
  }, [])

  return {
    teams,
    activeTeamId,
    setActiveTeamId,
    isLoading,
    refetchTeams: fetchTeams,
  }
}
